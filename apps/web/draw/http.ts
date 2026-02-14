import { HTTP_BACKEND } from "@/config";
import axios from "axios";



export async function getExistingShapes(roomid: string){
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomid}`);
    const messages = res.data.messages;

    const shapes = messages.map((msg: any) => { //map because it returns a new array
        const shapeData = JSON.parse(msg.message)
        return shapeData.shape;
    })

    return shapes;
}