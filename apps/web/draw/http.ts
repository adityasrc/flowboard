import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomid: string){
    try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${HTTP_BACKEND}/chats/${roomid}`,{
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });
        const messages = res.data.messages;

        const shapes = messages.map((msg: any) => { //map because it returns a new array
            const shapeData = JSON.parse(msg.message)
            return shapeData.shape;
        })

        return shapes;
    } catch (e: any) {
        if (e.response && e.response.status === 404) {
            // alert("Room not found! Redirecting to dashboard...");
            // window.location.href = "/dashboard";
        }
        return [];
    }
}