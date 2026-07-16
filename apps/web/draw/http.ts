import { HTTP_BACKEND } from "@/config";
import axios from "axios";

interface ChatMessage {
    id: string;
    message: string;
}

export async function getExistingShapes(roomid: string) {
    try {
        let token = "";
        try {
            token = localStorage.getItem("token") || "";
        } catch (err) {
            console.warn("Storage access blocked:", err);
        }

        const res = await axios.get(`${HTTP_BACKEND}/chats/${roomid}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const messages: ChatMessage[] = res.data.messages || [];

        // Using reduce/filter ensures one corrupted JSON payload in PostgreSQL 
        // doesn't crash the entire canvas rendering loop
        const shapes = messages
            .map((msg) => {
                try {
                    const shapeData = JSON.parse(msg.message);
                    return shapeData.shape || null;
                } catch (parseErr) {
                    console.warn("Skipping corrupted shape payload from DB:", msg.id);
                    return null;
                }
            })
            .filter((shape) => shape !== null); // Remove any null/corrupted entries

        return shapes;
    } catch (err: unknown) {
        // Authoritative check for Optimistic Routing: If room doesn't exist in DB,
        // send user back without trapping them in a browser 'Back' button loop.
        if (axios.isAxiosError(err) && err.response?.status === 404) {
            alert("Workspace not found! Redirecting to dashboard...");
            window.location.replace("/dashboard");
        } else {
            console.error("Failed to fetch existing workspace shapes:", err);
        }

        return [];
    }
}