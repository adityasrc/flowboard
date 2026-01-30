import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
const wss = new WebSocketServer({port: 8080});

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

wss.on("connection", function connection(ws, request){
    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";

    const userId = checkUser(token);
    if(!userId ){
        ws.close();
        return;
    }
    
    users.push({
        //we will push the user to out array
        userId,
        rooms: [],
        ws
    })

    ws.on("message", function message(data){
        //data will be type of string so we convert it to json first

        const parsedData = JSON.parse(data as unknown as string);
        if(parsedData.type === "joint_room"){
            const user = users.find(x => x.ws === ws);
            user?.rooms.push(parsedData.roomId);
            //does this room id exit? , need to add check
        }

        if(parsedData.type === "leave_room"){
            const user = users.find(x => x.ws === ws)
            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x === parsedData.room);
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message; //need to add check here for messages

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })

        }
    })

    //auth for room

})


