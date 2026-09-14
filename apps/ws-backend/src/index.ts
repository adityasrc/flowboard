import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { client } from "@repo/db/client";

const port = process.env.PORT ? Number(process.env.PORT) : 8081;
const HEARTBEAT_INTERVAL_MS = 30_000;

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: "ok",
        service: "ws-backend",
        timestamp: new Date().toISOString(),
      }),
    );
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({
  server,
  handleProtocols: (protocols) => {
    const [first] = protocols;
    return first ?? false;
  },
});

server.listen(port, () => {
  console.log(`WebSocket server listening on port ${port}`);
});

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  name: string;
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

// Cache roomSlug -> roomId to avoid DB queries on each shape
const roomCache = new LRUCache<string, number>(500);

async function resolveRoomId(roomSlug: string): Promise<number | null> {
  const cached = roomCache.get(roomSlug);
  if (cached) return cached;

  const room = await client.room.findUnique({
    where: { slug: roomSlug },
    select: { id: true },
  });

  if (!room) return null;

  roomCache.set(roomSlug, room.id);
  return room.id;
}

function broadcastToRoom(
  roomSlug: string,
  senderWs: WebSocket,
  payload: object,
) {
  const message = JSON.stringify(payload);
  users.forEach((u) => {
    if (
      u.ws !== senderWs &&
      u.rooms.includes(roomSlug) &&
      u.ws.readyState === WebSocket.OPEN
    ) {
      u.ws.send(message);
    }
  });
}

function checkUser(token: string): { userId: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded?.id) return null;
    return {
      userId: String(decoded.id),
      name: String(decoded.name || "Collaborator"),
    };
  } catch {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const headerValue = request.headers["sec-websocket-protocol"];
  const rawProtocol = Array.isArray(headerValue)
    ? headerValue[0]
    : headerValue || "";
  const token = rawProtocol.split(",")[0]?.trim() || "";

  const auth = checkUser(token);
  if (!auth) {
    ws.close(1008, "Unauthorized");
    return;
  }

  const { userId, name } = auth;

  users.push({ userId, name, rooms: [], ws, isAlive: true });

  ws.on("pong", () => {
    const user = users.find((u) => u.ws === ws);
    if (user) user.isAlive = true;
  });

  ws.on("close", () => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index === -1) return;

    const user = users[index]!;

    user.rooms.forEach((roomSlug) => {
      broadcastToRoom(roomSlug, ws, {
        type: "cursor_leave",
        userId: user.userId,
        roomId: roomSlug,
      });
    });

    users.splice(index, 1);
  });

  ws.on("message", async function message(data) {
    try {
      const user = users.find((x) => x.ws === ws);
      if (!user) return;

      const parsedData = JSON.parse(data.toString());

      switch (parsedData.type) {
        case "join_room": {
          const roomSlug = parsedData.roomId;
          if (!roomSlug || typeof roomSlug !== "string") break;

          try {
            const roomId = await resolveRoomId(roomSlug);
            if (!roomId) {
              ws.send(
                JSON.stringify({ type: "error", message: "Room not found." }),
              );
              break;
            }

            // Verify connecting user is a room member
            const membership = await client.room.findUnique({
              where: { id: roomId },
              select: {
                members: {
                  where: { id: Number(userId) },
                  select: { id: true },
                },
              },
            });

            if (!membership || membership.members.length === 0) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Not a member of this room.",
                }),
              );
              break;
            }

            if (!user.rooms.includes(roomSlug)) {
              user.rooms.push(roomSlug);
            }
          } catch (e) {
            console.error("Database error: Failed to verify room membership:", e);
          }
          break;
        }

        case "leave_room": {
          const roomSlug = parsedData.roomId;
          if (!roomSlug || typeof roomSlug !== "string") break;

          user.rooms = user.rooms.filter((r) => r !== roomSlug);

          broadcastToRoom(roomSlug, ws, {
            type: "cursor_leave",
            userId: user.userId,
            roomId: roomSlug,
          });
          break;
        }

        case "cursor": {
          const roomSlug = parsedData.roomId;
          const x = parsedData.x;
          const y = parsedData.y;

          if (
            !roomSlug ||
            typeof roomSlug !== "string" ||
            typeof x !== "number" ||
            typeof y !== "number"
          ) {
            break;
          }
          if (!user.rooms.includes(roomSlug)) break;

          broadcastToRoom(roomSlug, ws, {
            type: "cursor",
            userId,
            name,
            x,
            y,
            roomId: roomSlug,
          });
          break;
        }

        case "cursor_leave": {
          const roomSlug = parsedData.roomId;
          if (!roomSlug || typeof roomSlug !== "string") break;
          if (!user.rooms.includes(roomSlug)) break;

          broadcastToRoom(roomSlug, ws, {
            type: "cursor_leave",
            userId,
            roomId: roomSlug,
          });
          break;
        }

        case "shape": {
          const roomSlug = parsedData.roomId;
          const rawMessage: string = parsedData.message;
          if (!roomSlug || typeof roomSlug !== "string" || !rawMessage) break;
          if (!user.rooms.includes(roomSlug)) break;

          let shape: { id: string; type: string; [key: string]: unknown };
          try {
            shape = JSON.parse(rawMessage).shape;
            if (!shape || !shape.id || !shape.type) break;
          } catch {
            console.error("Validation error: Malformed shape payload");
            break;
          }

          try {
            const roomId = await resolveRoomId(roomSlug);
            if (!roomId) break;

            broadcastToRoom(roomSlug, ws, {
              type: "shape",
              message: rawMessage,
              roomId: roomSlug,
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
              .catch((e: unknown) => {
                console.error("Database error: Failed to persist shape:", e);
              });
          } catch (e) {
            console.error("Database error: Failed to process shape payload:", e);
          }
          break;
        }

        case "delete_shape": {
          const roomSlug = parsedData.roomId;
          const shapeId = parsedData.id;
          if (!roomSlug || typeof roomSlug !== "string" || !shapeId) break;
          if (!user.rooms.includes(roomSlug)) break;

          try {
            const roomId = await resolveRoomId(roomSlug);
            if (!roomId) break;

            broadcastToRoom(roomSlug, ws, {
              type: "delete_shape",
              id: shapeId,
              roomId: roomSlug,
            });

            client.shape
              .delete({
                where: {
                  roomId_shapeId: {
                    roomId,
                    shapeId: String(shapeId),
                  },
                },
              })
              .catch((e: unknown) =>
                console.error(
                  "Database error: Failed to delete shape record:",
                  e,
                ),
              );
          } catch (e) {
            console.error("Database error: Failed to process delete payload:", e);
          }
          break;
        }

        default:
          break;
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
