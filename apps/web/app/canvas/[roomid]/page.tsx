import { RoomCanvas } from "@/components/RoomCanvas";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{
    roomId?: string;
    roomid?: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const finalRoomId = resolvedParams.roomId || resolvedParams.roomid;

  if (!finalRoomId || finalRoomId === "undefined") {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-slate-50 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
        <p className="text-sm font-medium text-slate-500">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-white">
      <RoomCanvas roomId={finalRoomId} />
    </div>
  );
}