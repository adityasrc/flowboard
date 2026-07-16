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

// In-memory cache taaki har shape draw par bar-bar DB hit na ho
// Ye N+1 query exhaust problem ko seedha solve kar dega bina Redis ke.
const roomCache: Record<string, number> = {};

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.id) {
      console.log("Failed: ID is missing in token");
      return null;
    }

    return String(decoded.id);
  } catch (e) {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const headerValue = request.headers["sec-websocket-protocol"];
  const rawProtocol = Array.isArray(headerValue) ? headerValue[0] : (headerValue || "");

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
        // Prevent duplicate room subscriptions from causing repeated message broadcasts
        if (user && !user.rooms.includes(roomSlug)) {
          user.rooms.push(roomSlug);
          console.log("Joined room:", roomSlug);
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
        console.log("Left room:", roomSlug);
      }

      if (parsedData.type === "create_shape") {
        const roomSlug = parsedData.roomId;
        const message = parsedData.message;
        if (!roomSlug || typeof roomSlug !== "string" || !message) return;

        try {
          // Database connection pool exhaust hone se bachane ke liye pehle local memory (cache) check karo
          let roomId = roomCache[roomSlug];

          if (!roomId) {
            const room = await client.room.findUnique({
              where: { slug: roomSlug },
            });

            if (!room) {
              console.log("Room not found in DB");
              return;
            }
            // Pehli baar room mila toh cache me store kar lo O(1) time access ke liye
            roomId = room.id;
            roomCache[roomSlug] = room.id;
          }

          users.forEach((user) => {
            if (
              user.rooms.includes(roomSlug) &&
              user.ws.readyState === WebSocket.OPEN
            ) {
              user.ws.send(
                JSON.stringify({
                  type: "create_shape",
                  message: message,
                  roomId: roomSlug,
                }),
              );
            }
          });

          // Fire-and-forget: broadcast has already happened above.
          // We do NOT await here — a slow Neon DB round-trip must never stall
          // the event loop and freeze the canvas for all connected users.
          client.chat
            .create({
              data: {
                roomId: roomId,
                message,
                userId: Number(userId),
              },
            })
            .catch((e: unknown) => console.error("[DB] chat.create failed:", e));
        } catch (e) {
          console.log("DB Error:", e);
        }
      } else if (parsedData.type === "delete_shape") {
        const roomSlug = parsedData.roomId;
        const shapeId = parsedData.id;
        if (!roomSlug || typeof roomSlug !== "string" || !shapeId) return;

        try {
          let roomId = roomCache[roomSlug];

          if (!roomId) {
            const room = await client.room.findUnique({
              where: { slug: roomSlug },
            });
            if (!room) return;
            roomId = room.id;
            roomCache[roomSlug] = room.id;
          }

          // Optimistic UI Update: Broadcast deletion immediately before DB operation
          // so erasing shapes feels just as instant as drawing them.
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

          // Interview Knowledge Note: String text ke andar Prisma ka 'contains' SQL me LIKE '%shapeId%' banta hai.
          // Iska matlab ye poori Database Table ko line-by-line read (scan) karta hai O(N) time me.
          // Abhi demo ke liye theek hai but production me shapeId ko native DB Column banana padega indexing ke liye.
          client.chat
            .deleteMany({
              where: {
                roomId: roomId,
                message: {
                  contains: String(shapeId),
                },
              },
            })
            .catch((e: unknown) => console.error("[DB] chat.deleteMany failed:", e));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.log("Invalid JSON:", e);
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