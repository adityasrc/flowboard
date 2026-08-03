import { HTTP_BACKEND } from "@/config";
import axios from "axios";

interface DbShape {
  id: number;
  shapeData: string;
}

export async function getExistingShapes(roomid: string) {
  try {
    let token = "";
    try {
      token = localStorage.getItem("token") || "";
    } catch (err) {
      console.warn("Storage access blocked:", err);
    }

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.replace("/signin");
      }
      return [];
    }

    const res = await axios.get(`${HTTP_BACKEND}/api/v1/shapes/${roomid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dbShapes: DbShape[] = res.data.shapes || [];

    const shapes = dbShapes
      .map((row) => {
        try {
          const parsed = JSON.parse(row.shapeData);
          return parsed.shape || null;
        } catch {
          return null;
        }
      })
      .filter((shape) => shape !== null);

    return shapes;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        if (typeof window !== "undefined") {
          window.location.replace("/dashboard?error=not_found");
        }
      } else if (err.response?.status === 403) {
        if (typeof window !== "undefined") {
          window.location.replace("/dashboard?error=access_denied");
        }
      } else if (err.response?.status === 401) {
        try {
          localStorage.removeItem("token");
        } catch {}
        if (typeof window !== "undefined") {
          window.location.replace("/signin");
        }
      } else {
        console.error("Failed to fetch shapes:", err);
      }
    } else {
      console.error("Failed to fetch shapes:", err);
    }

    return [];
  }
}