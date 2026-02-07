"use client"
import { useEffect, useRef } from "react";

export default function Canvas(){

    const canvasRef = useRef<HTMLCanvasElement>(null);
    //pointer to the canvas

    useEffect(()=>{
        const canvas = canvasRef.current;
        //accessing the canvas element
        if(!canvas) return;

        const ctx = canvas.getContext("2d");
        if(!ctx) return;

        // rect(x, y, width, height)
        // ctx.strokeRect(10, 20, 150, 100);

        let isClicked = false;
        let startX = 0;
        let startY = 0;
        canvas.addEventListener("mousedown", (e)=>{
            isClicked = true;
            // console.log(e.clientX); //gives the x axis (cordinates)
            // console.log(e.clientY); //gives the y axis
            startX = e.clientX;
            startY = e.clientY;
        })

        canvas.addEventListener("mousemove", (e)=>{
            if(isClicked){
                // console.log(e.clientX);
                // console.log(e.clientY);
                const width = e.clientX - startX;
                const height = e.clientY - startY;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeRect(startX, startY, width, height);
            }
        })

        canvas.addEventListener("mouseup", (e)=>{
            isClicked = false;
            console.log(e.clientX);
            console.log(e.clientY);
        })


    }, [canvasRef])


    return(
        <div>
           <canvas ref={canvasRef}/>
        </div>
    )
}