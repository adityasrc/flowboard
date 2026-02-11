"use client"
import initDraw from "@/draw";
import { useEffect, useRef, useState } from "react";

interface CanvasProps {
    roomId : string;
    socket : WebSocket;
}

export function Canvas({ roomId, socket }: CanvasProps){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    //pointer to the canvas

    useEffect(()=>{
        const canvas = canvasRef.current;
        //accessing the canvas element
        if(!canvas) return;
        canvas.width = window.innerWidth; //make canvas dimension  = windwo dimension
        canvas.height = window.innerHeight;

        console.log("Canvas Init with:", { roomId, socket });

        
        if (socket && roomId) {
             initDraw(canvas, roomId, socket);
        }


    }, [roomId, socket])


    return(
        <div>
           <canvas ref={canvasRef}/>
        </div>
    )
}