import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";

const port = process.env.PORT ? Number(process.env.PORT) : 8081;

const wss = new WebSocketServer({ port });
// WebSockets are "push" (server can send data whenever it wants).
// console.log("Ws Server started on 8081");

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

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
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]); //to extract jwt form url
  const token = queryParams.get("token") || "";

  const userId = checkUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  users.push({
    //we will push the user to our array
    userId,
    rooms: [],
    ws,
  });


  ws.on("close", ()=>{
    const index = users.findIndex(function(user){
      return user.ws === ws
    })

    if(index != -1){
      users.splice(index, 1)
    }
  })



  ws.on("message", async function message(data) {
    try {
      let parsedData;
      if (typeof data !== "string") {
        //  Data ko string mein convert karna zaroori hai
        parsedData = JSON.parse(data.toString());

      } else {
        parsedData = JSON.parse(data);
      }

      if (parsedData.type === "join_room") {
        const user = users.find((x) => x.ws === ws);
        user?.rooms.push(parsedData.roomId);
        console.log("Joined room:", parsedData.roomId);
      }

      if (parsedData.type === "leave_room") {
        const user = users.find((x) => x.ws === ws);
        if (!user) {
          return;
        }
        user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
        console.log("Left room:", parsedData.roomId);
      }

      if (parsedData.type === "create_shape") {
        const roomSlug = parsedData.roomId;
        const message = parsedData.message;

        try {
          const room = await client.room.findUnique({
            where: {
              slug: roomSlug,
            },
          });

          if (!room) {
            console.log("Room not found in DB");
            return;
          }

          //queue is the better approach

          users.forEach((user) => {
            if (user.rooms.includes(roomSlug)) {
              //  Check against slug, not object
              user.ws.send(
                JSON.stringify({
                  type: "create_shape",
                  message: message,
                  roomId: roomSlug, // Send back the slug so client knows where to put it
                }),
              );
              console.log("Sent message to user");
            }
          });

          await client.chat.create({
            data: {
              roomId: room.id,
              message,
              userId: Number(userId),
            },
          });
          
        } catch (e) {
          console.log("DB Error:", e);
        }

      } else if (parsedData.type === "delete_shape") {
        const roomSlug = parsedData.roomId;
        const shapeId = parsedData.id;

        try {
          const room = await client.room.findUnique({
            where: {slug: roomSlug}
          });
          if(!room) return;

          await client.chat.deleteMany({
            where: {
              roomId: room.id,
              message: {
                contains: shapeId,
              },
            },
          });

          users.forEach((user) => {
            if (user.rooms.includes(roomSlug)) {
              user.ws.send(
                JSON.stringify({
                  type: "delete_shape",
                  id: shapeId,
                  roomId: roomSlug,
                }),
              );
            }
          });
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
