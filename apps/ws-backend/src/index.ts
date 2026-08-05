import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";

const port = process.env.PORT ? Number(process.env.PORT) : 8081;

// Clients that don't respond to a ping before the next cycle are considered dead
// and terminated, preventing silent ghost connections from accumulating.
const HEARTBEAT_INTERVAL_MS = 30_000;

// The browser sends the JWT as the first WebSocket sub-protocol value.
// We echo it back so the handshake succeeds.
const wss = new WebSocketServer({
  port,
  handleProtocols: (protocols) => {
    const [first] = protocols;
    return first ?? false;
  },
});

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  isAlive: boolean;
}

const users: User[] = [];

class LRUCache<K, V> {
  private map = new Map<K, V>();
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.limit) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
  }
}

// Caches roomSlug -> roomId to avoid a DB round-trip on every shape event.
const roomCache = new LRUCache<string, number>(500);

function checkUser(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded?.id) return null;
    return { userId: String(decoded.id) };
  } catch {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const headerValue = request.headers["sec-websocket-protocol"];
  const rawProtocol = Array.isArray(headerValue) ? headerValue[0] : headerValue || "";
  const token = rawProtocol.split(",")[0]?.trim() || "";

  const auth = checkUser(token);
  if (!auth) {
    ws.close();
    return;
  }

  const { userId } = auth;

  users.push({ userId, rooms: [], ws, isAlive: true });

  ws.on("pong", () => {
    const user = users.find((u) => u.ws === ws);
    if (user) user.isAlive = true;
  });

  ws.on("close", () => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index === -1) return;

    const user = users[index]!;

    user.rooms.forEach((roomSlug) => {
      users.forEach((u) => {
        if (u.ws !== ws && u.rooms.includes(roomSlug) && u.ws.readyState === WebSocket.OPEN) {
          u.ws.send(JSON.stringify({ type: "cursor_leave", userId: user.userId, roomId: roomSlug }));
        }
      });
    });

    users.splice(index, 1);
  });

  ws.on("message", async function message(data) {
    try {
      const parsedData = JSON.parse(data.toString());

      if (parsedData.type === "join_room") {
        const roomSlug = parsedData.roomId;
        if (!roomSlug || typeof roomSlug !== "string") return;

        const user = users.find((x) => x.ws === ws);
        if (!user) return;

        if (user.rooms.includes(roomSlug)) return;

        try {
          const room = await client.room.findUnique({
            where: { slug: roomSlug },
            select: {
              id: true,
              members: {
                where: { id: Number(userId) },
                select: { id: true },
              },
            },
          });

          if (!room) {
            ws.send(JSON.stringify({ type: "error", message: "Room not found." }));
            return;
          }

          if (room.members.length === 0) {
            await client.room.update({
              where: { id: room.id },
              data: { members: { connect: { id: Number(userId) } } },
            });
          }

          user.rooms.push(roomSlug);
          roomCache.set(roomSlug, room.id);
        } catch (e) {
          console.error("Database error: Failed to verify room membership:", e);
        }

        return;
      }

      if (parsedData.type === "leave_room") {
        const roomSlug = parsedData.roomId;
        if (!roomSlug || typeof roomSlug !== "string") return;

        const user = users.find((x) => x.ws === ws);
        if (!user) return;

        user.rooms = user.rooms.filter((r) => r !== roomSlug);

        users.forEach((u) => {
          if (u.ws !== ws && u.rooms.includes(roomSlug) && u.ws.readyState === WebSocket.OPEN) {
            u.ws.send(JSON.stringify({ type: "cursor_leave", userId: user.userId, roomId: roomSlug }));
          }
        });

        return;
      }

      if (parsedData.type === "cursor") {
        const roomSlug = parsedData.roomId;
        const x = parsedData.x;
        const y = parsedData.y;

        if (!roomSlug || typeof roomSlug !== "string" || typeof x !== "number" || typeof y !== "number") return;

        users.forEach((u) => {
          if (u.ws !== ws && u.rooms.includes(roomSlug) && u.ws.readyState === WebSocket.OPEN) {
            u.ws.send(JSON.stringify({ type: "cursor", userId, x, y, roomId: roomSlug }));
          }
        });

        return;
      }

      if (parsedData.type === "shape") {
        const roomSlug = parsedData.roomId;
        const rawMessage: string = parsedData.message;
        if (!roomSlug || typeof roomSlug !== "string" || !rawMessage) return;

        let shape: { id: string; type: string; [key: string]: unknown };
        try {
          shape = JSON.parse(rawMessage).shape;
          if (!shape || !shape.id || !shape.type) return;
        } catch {
          console.error("Validation error: Malformed shape payload");
          return;
        }

        try {
          let roomId = roomCache.get(roomSlug);

          if (!roomId) {
            const room = await client.room.findUnique({ where: { slug: roomSlug } });
            if (!room) return;
            roomId = room.id;
            roomCache.set(roomSlug, room.id);
          }

          users.forEach((u) => {
            if (u.ws !== ws && u.rooms.includes(roomSlug) && u.ws.readyState === WebSocket.OPEN) {
              u.ws.send(JSON.stringify({ type: "shape", message: rawMessage, roomId: roomSlug }));
            }
          });

          client.shape
            .create({
              data: {
                roomId,
                userId: Number(userId),
                shapeId: shape.id,
                shapeType: shape.type,
                shapeData: rawMessage,
              },
            })
            .catch((e: unknown) => console.error("Database error: Failed to create shape record:", e));
        } catch (e) {
          console.error("Database error: Failed to process shape payload:", e);
        }

        return;
      }

      if (parsedData.type === "delete_shape") {
        const roomSlug = parsedData.roomId;
        const shapeId = parsedData.id;
        if (!roomSlug || typeof roomSlug !== "string" || !shapeId) return;

        try {
          let roomId = roomCache.get(roomSlug);

          if (!roomId) {
            const room = await client.room.findUnique({ where: { slug: roomSlug } });
            if (!room) return;
            roomId = room.id;
            roomCache.set(roomSlug, room.id);
          }

          users.forEach((u) => {
            if (u.ws !== ws && u.rooms.includes(roomSlug) && u.ws.readyState === WebSocket.OPEN) {
              u.ws.send(JSON.stringify({ type: "delete_shape", id: shapeId, roomId: roomSlug }));
            }
          });

          client.shape
            .deleteMany({
              where: { roomId, shapeId: String(shapeId) },
            })
            .catch((e: unknown) => console.error("Database error: Failed to delete shape record:", e));
        } catch (e) {
          console.error("Database error: Failed to process delete payload:", e);
        }
      }
    } catch (e) {
      console.error("Parse error: Failed to parse WebSocket message:", e);
    }
  });
});

const heartbeat = setInterval(() => {
  [...users].forEach((user) => {
    if (!user.isAlive) {
      user.ws.terminate();
      return;
    }
    user.isAlive = false;
    user.ws.ping();
  });
}, HEARTBEAT_INTERVAL_MS);

wss.on("close", () => clearInterval(heartbeat));
