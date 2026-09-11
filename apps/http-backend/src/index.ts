import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import helmet from "helmet";
import { middleware } from "./middleware";
import { JWT_SECRET } from "./config";
import { client } from "@repo/db/client";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
  generateSlug,
} from "@repo/common";
import { authLimiter, apiLimiter } from "./rateLimit";

const app = express();
const port = process.env.HTTP_PORT || 3001;

// Trust reverse proxy (for real client IP in rate limiters)
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json({ limit: "1mb" }));

// Dummy hash for constant-time comparison when user doesn't exist
const DUMMY_HASH =
  "$2b$10$bIjz5K9jgwV7voJn8DQ9o.g5AAn99ZGuZzH.suG3dxNPnFuLVD50y";

app.get(["/health", "/api/v1/health"], function (req, res) {
  return res.status(200).json({
    status: "ok",
    message: "Server is running fine",
    timeStamp: new Date().toISOString(),
  });
});

app.post("/api/v1/auth/signup", authLimiter, async function (req, res) {
  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    const message = parsedData.error.issues[0]?.message || "Invalid inputs";
    return res.status(400).json({ message });
  }

  try {
    const existingUser = await client.user.findUnique({
      where: { email: parsedData.data.email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
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
      return res.json({ userId: user.id });
    } catch (createErr: unknown) {
      if ((createErr as { code?: string })?.code === "P2002") {
        return res
          .status(409)
          .json({ message: "User already exists with this email" });
      }
      throw createErr;
    }
  } catch (e) {
    console.error("Signup error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/v1/auth/signin", authLimiter, async function (req, res) {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  try {
    const user = await client.user.findUnique({
      where: { email: parsedData.data.email },
    });

    // Constant-time check to prevent user enumeration
    const hashToCompare = user?.password || DUMMY_HASH;
    const passwordMatch = await bcrypt.compare(
      parsedData.data.password,
      hashToCompare,
    );

    if (!user || !passwordMatch) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({ token });
  } catch (e) {
    console.error("Signin error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/v1/canvases", apiLimiter, middleware, async function (req, res) {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const userId = req.userId!;
  const slug = generateSlug(parsedData.data.name);

  try {
    const existingRoom = await client.room.findUnique({
      where: { slug },
    });

    if (existingRoom) {
      return res
        .status(409)
        .json({ message: "A room with this name already exists." });
    }

    try {
      const room = await client.room.create({
        data: {
          slug,
          adminId: userId,
          members: {
            connect: { id: userId },
          },
        },
      });
      return res.json({ roomId: room.id });
    } catch (createErr: unknown) {
      if ((createErr as { code?: string })?.code === "P2002") {
        return res
          .status(409)
          .json({ message: "A room with this name already exists." });
      }
      throw createErr;
    }
  } catch (e) {
    console.error("Database error: Failed to create room:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/v1/canvases", apiLimiter, middleware, async function (req, res) {
  const userId = req.userId!;

  try {
    const rooms = await client.room.findMany({
      where: {
        members: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        slug: true,
        adminId: true,
      },
    });

    const formattedRooms = rooms.map((room) => ({
      id: room.id,
      slug: room.slug,
      isOwner: room.adminId === userId,
    }));

    return res.json({ rooms: formattedRooms });
  } catch (e) {
    console.error("Database error: Failed to fetch rooms for user:", e);
    return res.status(500).json({ message: "Error fetching rooms" });
  }
});

app.get(
  "/api/v1/shapes/:roomSlug",
  apiLimiter,
  middleware,
  async function (req, res) {
    try {
      const roomSlug = req.params.roomSlug;
      const userId = req.userId!;

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

      if (roomData.members.length === 0) {
        return res.status(403).json({ message: "Join this room first" });
      }

      const shapes = await client.shape.findMany({
        where: { roomId: roomData.id },
        orderBy: { id: "desc" },
        take: 250,
      });

      return res.json({ shapes: shapes.reverse() });
    } catch (e) {
      console.error("Database error: Failed to fetch shapes for room:", e);
      return res.status(500).json({
        message: "Internal server error while fetching shapes",
        shapes: [],
      });
    }
  },
);

// Room owner deletes canvas; members only leave canvas
const deleteCanvasHandler = async function (
  req: express.Request,
  res: express.Response,
) {
  const userId = req.userId!;
  const canvasSlug = req.params.canvasSlug;

  try {
    const room = await client.room.findUnique({
      where: { slug: canvasSlug },
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
    console.error("Database error: Failed to delete room:", e);
    return res
      .status(500)
      .json({ message: "Internal server error while deleting room" });
  }
};

app.delete(
  "/api/v1/canvases/:canvasSlug",
  apiLimiter,
  middleware,
  deleteCanvasHandler,
);

app.post(
  "/api/v1/canvases/:canvasSlug/members",
  apiLimiter,
  middleware,
  async function (req, res) {
    const userId = req.userId!;
    const canvasSlug = req.params.canvasSlug;

    try {
      const room = await client.room.findUnique({
        where: { slug: canvasSlug },
      });

      if (!room) {
        return res.status(404).json({ message: "Canvas not found" });
      }

      await client.room.update({
        where: { id: room.id },
        data: {
          members: { connect: { id: userId } },
        },
      });
      return res.json({ message: "Joined successfully", canvasId: room.id });
    } catch (e) {
      console.error("Database error: Failed to add user to canvas:", e);
      return res
        .status(500)
        .json({ message: "Internal server error while joining room" });
    }
  },
);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled server error:", err);
    const status = typeof err?.status === "number" ? err.status : 500;
    const message =
      status === 413 ? "Payload too large" : "Internal server error";
    return res.status(status).json({ message });
  },
);

app.listen(port, () => {
  console.log(`HTTP Server is running on port ${port}`);
});
