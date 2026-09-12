import { RoomCanvas } from "@/components/RoomCanvas";
import { notFound } from "next/navigation";

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
    notFound();
  }

  return <RoomCanvas roomId={finalRoomId} />;
}