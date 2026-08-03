import "./loadEnv"; // Must be first, loads root .env before any other import
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";
import { CreateUserSchema, SigninSchema, CreateRoomSchema, generateSlug } from "@repo/common";
import { authLimiter, apiLimiter } from "./rateLimit";

const app = express();
const port = process.env.HTTP_PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", function (req, res) {
  res.status(200).json({
    message: "Server is running fine",
    timeStamp: new Date().toISOString(),
  });
});

app.post("/api/v1/auth/signup", authLimiter, async function (req, res) {
  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid inputs" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const user = await client.user.create({
      data: {
        name: parsedData.data.name,
        email: parsedData.data.email,
        password: hashedPassword,
      },
    });
    res.json({ userId: user.id });
  } catch (e) {
    res.status(409).json({ message: "User already exists with this email" });
  }
});

app.post("/api/v1/auth/signin", authLimiter, async function (req, res) {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const user = await client.user.findUnique({
    where: { email: parsedData.data.email },
  });

  if (!user) {
    return res.status(403).json({ message: "Incorrect credentials" });
  }

  const passwordMatch = await bcrypt.compare(parsedData.data.password, user.password);

  if (!passwordMatch) {
    return res.status(403).json({ message: "Incorrect credentials" });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return res.json({ token });
});

app.post("/api/v1/canvas", apiLimiter, middleware, async function (req, res) {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  const userId = req.userId;
  const slug = generateSlug(parsedData.data.name);

  try {
    const room = await client.room.create({
      data: {
        slug,
        adminId: Number(userId),
        members: {
          connect: { id: Number(userId) },
        },
      },
    });
    res.json({ roomId: room.id });
  } catch (e: any) {
    console.error("Database error: Failed to create room:", e);
    if (e.code === "P2002") {
      res.status(409).json({ message: "A room with this name already exists." });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

app.get("/api/v1/canvases", apiLimiter, middleware, async function (req, res) {
  const userId = req.userId;

  try {
    const rooms = await client.room.findMany({
      where: {
        members: {
          some: { id: Number(userId) },
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    res.json({ rooms });
  } catch (e) {
    console.error("Database error: Failed to fetch rooms for user:", e);
    res.status(500).json({ message: "Error fetching rooms" });
  }
});

app.get("/api/v1/shapes/:roomSlug", apiLimiter, middleware, async function (req, res) {
  try {
    const roomSlug = req.params.roomSlug;
    const userId = Number(req.userId);

    const roomData = await client.room.findUnique({
      where: { slug: roomSlug },
      select: {
        id: true,
        members: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Auto-join authenticated users the first time they access a room
    if (roomData.members.length === 0) {
      await client.room.update({
        where: { id: roomData.id },
        data: {
          members: { connect: { id: userId } },
        },
      });
    }

    const shapes = await client.shape.findMany({
      where: { roomId: roomData.id },
      orderBy: { id: "desc" },
      take: 250,
    });

    res.json({ shapes: shapes.reverse() });
  } catch (e) {
    console.error("Database error: Failed to fetch shapes for room:", e);
    res.status(500).json({ message: "Internal server error while fetching shapes", shapes: [] });
  }
});

const deleteRoomHandler = async function (req: express.Request, res: express.Response) {
  const userId = Number(req.userId);
  const roomIdParam = req.params.roomId;
  const numericId = Number(roomIdParam);
  const isNumeric = !isNaN(numericId) && numericId > 0;

  try {
    const room = await client.room.findFirst({
      where: isNumeric ? { id: numericId } : { slug: roomIdParam },
    });

    if (!room) {
      return res.status(404).json({ message: "Canvas not found" });
    }

    if (room.adminId === userId) {
      await client.room.delete({ where: { id: room.id } });
      return res.json({ message: "Canvas deleted successfully" });
    }

    await client.room.update({
      where: { id: room.id },
      data: {
        members: { disconnect: { id: userId } },
      },
    });
    return res.json({ message: "Canvas removed from your list" });
  } catch (e) {
    console.error("Database error: Failed to delete canvas:", e);
    res.status(500).json({ message: "Internal server error while deleting canvas" });
  }
};

app.delete("/api/v1/canvas/:roomId", apiLimiter, middleware, deleteRoomHandler);
app.delete("/api/v1/room/:roomId", apiLimiter, middleware, deleteRoomHandler);

app.get("/api/v1/canvas/:roomSlug/join", apiLimiter, middleware, async function (req, res) {
  const userId = req.userId;
  const roomSlug = req.params.roomSlug;

  try {
    const room = await client.room.findUnique({ where: { slug: roomSlug } });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await client.room.update({
      where: { slug: roomSlug },
      data: {
        members: { connect: { id: Number(userId) } },
      },
    });
    res.json({ message: "Joined successfully", roomId: room.id });
  } catch (e) {
    console.error("Database error: Failed to add user to room:", e);
    res.status(500).json({ message: "Internal server error while joining room" });
  }
});

app.listen(port, () => {
  console.log(`HTTP Server is running on port ${port}`);
});
