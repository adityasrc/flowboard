import { RoomCanvas } from "@/components/RoomCanvas";
// import { param } from "framer-motion/client";

interface PageProps{
    params: Promise<{ //nextjs  15 me prarams promise hota hai
        roomId: string;
    }>
}

export default async function ({params } : PageProps){
    const { roomId } = await params;
    //from next 15, params returns promises

    console.log("Server received Room ID:", roomId);

    return(
        <div>
            <RoomCanvas roomId={roomId}/>
        </div>
    )

}