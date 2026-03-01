import { RoomCanvas } from "@/components/RoomCanvas";
// import { param } from "framer-motion/client";

interface PageProps{
    params: Promise<{ //nextjs  15 me prarams promise hota hai
        roomid: string;
    }>
}

export default async function ({params } : PageProps){
    const { roomid } = await params;
    //from next 15, params returns promises

    console.log("Server received Room ID:", roomid);

    return(
        <div>
            <RoomCanvas roomId={roomid}/>
        </div>
    )

}