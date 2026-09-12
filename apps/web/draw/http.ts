import { api } from "@/lib/api";
import { Shape } from "./types";

interface DbShape {
  id: number;
  shapeData: string;
}

export async function getExistingShapes(roomId: string): Promise<Shape[]> {
  const res = await api.get<{ shapes: DbShape[] }>(`/api/v1/shapes/${roomId}`);
  const dbShapes: DbShape[] = res.data.shapes || [];

  return dbShapes
    .map((row) => {
      try {
        const parsed = JSON.parse(row.shapeData);
        return parsed.shape || null;
      } catch {
        return null;
      }
    })
    .filter((shape): shape is Shape => shape !== null);
}