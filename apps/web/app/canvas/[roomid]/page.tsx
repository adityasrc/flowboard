import { RoomCanvas } from "@/components/RoomCanvas";

interface PageProps {
  params: Promise<{
    // Dono ko define kar do taaki TS gussa na kare
    roomId?: string;
    roomid?: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  
  // jo bhi available ho (roomId ya roomid), use utha lo
  const finalRoomId = resolvedParams.roomId || resolvedParams.roomid;

  console.log("Server received Room ID:", finalRoomId);

  // agar kuch bhi nahi mila, toh crash hone se bachao
  if (!finalRoomId || finalRoomId === "undefined") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div>
      <RoomCanvas roomId={finalRoomId} />
    </div>
  );
}