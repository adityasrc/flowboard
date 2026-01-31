import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8081 });

console.log("Ws Server started on 8081");

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
    console.log("1. Checking token:", token); // Is the token arriving?

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        console.log("2. Decoded Token:", decoded); // What is inside?

        if (!decoded || !decoded.id) {
            console.log("3. Failed: ID is missing in token");
            return null;
        }

        console.log("4. Success! User ID:", decoded.id);
        return decoded.id;

    } catch (e) {
        console.log("3. Failed: Verify crashed. Error:", e);
        return null;
    }
}

wss.on("connection", function connection(ws, request) {
    const url = request.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";

    const userIdOrNull = checkUser(token);
    if (!userIdOrNull) {
        ws.close();
        return;
    }

    const userId = userIdOrNull;

    users.push({
        //we will push the user to out array
        userId,
        rooms: [],
        ws
    })

    ws.on("message", async function message(data) {
        try {
            // 1. Data ko string mein convert karna zaroori hai 
            const parsedData = JSON.parse(data.toString());

            if (parsedData.type === "join_room") {
                const user = users.find(x => x.ws === ws);
                user?.rooms.push(parsedData.roomId);
                console.log("Joined room:", parsedData.roomId);
            }

            if (parsedData.type === "leave_room") {
                const user = users.find(x => x.ws === ws);
                if (!user) {
                    return;
                }
                // 2. Fix: Logic was inverted! We want to KEEP rooms that are NOT the one we left
                user.rooms = user.rooms.filter(x => x !== parsedData.room);
                console.log("Left room:", parsedData.room);
            }


            if (parsedData.type === "chat") {
                const roomSlug = parsedData.roomId;
                const message = parsedData.message;

                // console.log("Attempting to send chat to room:", roomId);
                try {
                    const room = await client.room.findUnique({
                        where: {
                            slug: roomSlug
                        }
                    })

                    if (!room) {
                        console.log("Room not found in DB");
                        return; // FIX ADDED: Stop execution if room is missing
                    }

                    await client.chat.create({
                        data: {
                            roomId: room.id,
                            message,
                            userId: Number(userId)
                        }
                    })
                    //first add in db then brodcast
                    //queue is the better approach

                    users.forEach(user => {
                        // Check: Is the user actually in this room
                        if (user.rooms.includes(roomSlug)) { // FIX ADDED: Check against slug, not object
                            user.ws.send(JSON.stringify({
                                type: "chat",
                                message: message,
                                roomId: roomSlug // FIX ADDED: Send back the slug so client knows where to put it
                            }));
                            console.log("➡️ Sent message to user");
                        }
                    }); // FIX ADDED: Correct closing for forEach
                } catch (e) {
                    console.log("DB Error:", e);
                }
            }

        } catch (e) {
            console.log("Invalid JSON:", e);
            return;
        }
    });

    //auth for room

})