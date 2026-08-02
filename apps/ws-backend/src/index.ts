import "./loadEnv"; // MUST be first — loads root .env before any other import executes
import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";

const port = process.env.PORT ? Number(process.env.PORT) : 8081;

// Interval at which the server sends a ping to every connected client.
// If the client does not pong back before the next interval, it is considered
// dead and its socket is terminated — preventing silent ghost connections.
const HEARTBEAT_INTERVAL_MS = 30_000;

// Accept any offered sub-protocol so the browser does not immediately close
// the connection. The first protocol value is the JWT token sent by the client.
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
  isAlive: boolean; // tracks whether the client responded to the last ping
}

const users: User[] = [];

// Map-based LRU Cache to prevent unbounded memory growth.
// Map preserves insertion order, so the oldest entry is always map.keys().next().value.
class LRUCache<K, V> {
  private map = new Map<K, V>();
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    // Delete and re-insert to mark as most recently used
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    // If over limit, evict the oldest entry (first key in insertion order)
    if (this.map.size > this.limit) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
  }
}

// Caches roomSlug -> roomId to avoid hitting the DB on every shape event.
// Capped at 500 entries; least recently used rooms are evicted first.
const roomCache = new LRUCache<string, number>(500);

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.id) {
      console.error("Authentication error: User ID missing in token");
      return null;
    }

    return String(decoded.id);
  } catch (e) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const headerValue = request.headers["sec-websocket-protocol"];
  const rawProtocol = Array.isArray(headerValue)
    ? headerValue[0]
    : headerValue || "";

  const token = rawProtocol.split(",")[0]?.trim() || "";

  const userId = checkUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws,
    isAlive: true,
  });

  // Mark the connection as alive each time the client pongs back.
  ws.on("pong", () => {
    const user = users.find((u) => u.ws === ws);
    if (user) user.isAlive = true;
  });

  ws.on("close", () => {
    const index = users.findIndex(function (user) {
      return user.ws === ws;
    });

    if (index !== -1) {
      users.splice(index, 1);
    }
  });

  ws.on("message", async function message(data) {
    try {
      let parsedData;
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }

      if (parsedData.type === "join_room") {
        const roomSlug = parsedData.roomId;
        if (!roomSlug || typeof roomSlug !== "string") return;

        const user = users.find((x) => x.ws === ws);
        if (!user) return;

        if (!user.rooms.includes(roomSlug)) {
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
              console.error(`Room not found: ${roomSlug}`);
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Room not found.",
                }),
              );
              return;
            }

            // Auto-join member in DB if not already present
            if (room.members.length === 0) {
              await client.room.update({
                where: { id: room.id },
                data: {
                  members: {
                    connect: { id: Number(userId) },
                  },
                },
              });
            }

            // Authorized! Add to active WS room list
            user.rooms.push(roomSlug);
            roomCache.set(roomSlug, room.id);
          } catch (e) {
            console.error("Database error: Failed to verify room membership:", e);
          }
        }
      }

      if (parsedData.type === "leave_room") {
        const roomSlug = parsedData.roomId;
        if (!roomSlug || typeof roomSlug !== "string") return;

        const user = users.find((x) => x.ws === ws);
        if (!user) {
          return;
        }
        user.rooms = user.rooms.filter((x) => x !== roomSlug);
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
          // Check local cache first to avoid a DB hit on every shape event
          let roomId = roomCache.get(roomSlug);

          if (!roomId) {
            const room = await client.room.findUnique({
              where: { slug: roomSlug },
            });

            if (!room) {
              console.error("Not found error: Room does not exist");
              return;
            }
            // Cache on first lookup for O(1) access going forward
            roomId = room.id;
            roomCache.set(roomSlug, room.id);
          }

          // Broadcast the original raw message payload to all users in the room
          users.forEach((u) => {
            if (
              u.rooms.includes(roomSlug) &&
              u.ws.readyState === WebSocket.OPEN &&
              u.ws != ws
            ) {
              u.ws.send(
                JSON.stringify({
                  type: "chat",
                  message: rawMessage,
                  roomId: roomSlug,
                }),
              );
            }
          });

          client.shape
            .create({
              data: {
                roomId: roomId,
                userId: Number(userId),
                shapeId: shape.id, // UUID from frontend
                shapeType: shape.type, // "Rect", "Circle", etc.
                shapeData: rawMessage, // Full JSON string for rendering
              },
            })
            .catch((e: unknown) =>
              console.error("Database error: Failed to create shape record:", e),
            );
        } catch (e) {
          console.error("Database error: Failed to process shape payload:", e);
        }
      } else if (parsedData.type === "delete_shape") {
        const roomSlug = parsedData.roomId;
        const shapeId = parsedData.id;
        if (!roomSlug || typeof roomSlug !== "string" || !shapeId) return;

        try {
          let roomId = roomCache.get(roomSlug);

          if (!roomId) {
            const room = await client.room.findUnique({
              where: { slug: roomSlug },
            });
            if (!room) return;
            roomId = room.id;
            roomCache.set(roomSlug, room.id);
          }

          users.forEach((user) => {
            if (
              user.rooms.includes(roomSlug) &&
              user.ws.readyState === WebSocket.OPEN
            ) {
              user.ws.send(
                JSON.stringify({
                  type: "delete_shape",
                  id: shapeId,
                  roomId: roomSlug,
                }),
              );
            }
          });

          client.shape
            .deleteMany({
              where: {
                roomId: roomId,
                shapeId: String(shapeId), // Direct lookup via indexed shapeId column
              },
            })
            .catch((e: unknown) =>
              console.error("Database error: Failed to delete shape record:", e),
            );
        } catch (e) {
          console.error("Database error: Failed to process delete payload:", e);
        }
      }
    } catch (e) {
      console.error("Parse error: Failed to parse WebSocket message:", e);
      return;
    }
  });
});

// Heartbeat: every HEARTBEAT_INTERVAL_MS seconds, ping all clients.
// Any client that does not pong back before the next cycle is considered a
// ghost connection and is forcefully terminated + removed from users[].
const heartbeat = setInterval(() => {
  // Use a shallow copy [...users] to prevent array mutation bugs during splice/terminate
  [...users].forEach((user) => {
    if (!user.isAlive) {
      // No pong received since last ping — terminate the stale connection.
      user.ws.terminate();
      return;
    }
    user.isAlive = false; // reset; will be flipped back to true on pong
    user.ws.ping();
  });
}, HEARTBEAT_INTERVAL_MS);

// Clean up the interval when the WSS itself is closed (e.g., on shutdown).
wss.on("close", () => clearInterval(heartbeat));
