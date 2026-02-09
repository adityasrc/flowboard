import { RoomCanvas } from "@/components/RoomCanvas";
// import { param } from "framer-motion/client";

interface PageProps{
    params: {
        roomId: string;
    }
}

export default async function ({params } : PageProps){
    const { roomId } = await params;
    //from next 15, params returns promises

    return(
        <div>
            <RoomCanvas roomId={roomId}/>
        </div>
    )


}