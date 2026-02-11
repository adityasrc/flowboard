"use client"
import { WS_BACKEND } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "@/components/Canvas";

interface CanvasProps {
    roomId : string;
}

export function RoomCanvas({ roomId }: CanvasProps){
    const [socket, setSocket] = useState<WebSocket | null>(null);
    //pointer to the canvas

    useEffect(()=>{
        const ws = new WebSocket(`${WS_BACKEND}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImlhdCI6MTc3MDgwNjgxN30.JmdQWHG9kewVw2K62NGs3MaY2nML2y7i7_KmJko077c`);

        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId: roomId
            }))
        }

        return ()=>{
            ws.close();
        }

    }, [roomId])
    

    if(!socket){
        return(
            <div>
                Connecting to server.....
            </div>
        )
    }


    return(
        <div>
           <Canvas roomId={roomId} socket={socket}/>
        </div>
    )
}