"use client"
import initDraw from "@/draw";
import { useEffect, useRef } from "react";

interface CanvasProps {
    roomId : string;
}

export function RoomCanvas({ roomId }: CanvasProps){
    const canvasRef = useRef<HTMLCanvasElement>(null);
    //pointer to the canvas

    useEffect(()=>{
        const canvas = canvasRef.current;
        //accessing the canvas element
        if(!canvas) return;
        canvas.width = window.innerWidth; //make canvas dimension  = windwo dimension
        canvas.height = window.innerHeight;

        initDraw(canvas, roomId);


    }, [roomId])


    return(
        <div>
           <canvas ref={canvasRef}/>
        </div>
    )
}