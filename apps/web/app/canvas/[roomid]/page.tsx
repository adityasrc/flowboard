"use client"
import initDraw from "@/draw";
import { useEffect, useRef } from "react";

export default function Canvas(){

    const canvasRef = useRef<HTMLCanvasElement>(null);
    //pointer to the canvas

    useEffect(()=>{
        const canvas = canvasRef.current;
        //accessing the canvas element
        if(!canvas) return;

        initDraw(canvas);


    }, [canvasRef])


    return(
        <div>
           <canvas ref={canvasRef} width={2000} height={1000}/>
        </div>
    )
}