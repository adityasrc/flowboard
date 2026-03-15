import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
const port = process.env.HTTP_PORT || 3001; // process.env is a node js object
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common";
import cors from "cors";
import { authLimiter, apiLimiter } from "./rateLimit";

app.use(cors()); // allows frontend to talk to express backend
app.use(express.json()); //parses incoming JSON into req.body

app.get("/", function (req, res) {
  res.status(200).json({
    message: "Server is runnine fine, chill pill!",
    timeStamp: new Date().toISOString(),
  });
});

app.post("/signup", authLimiter, async function (req, res) {
  //.Parse just returns either data or error
  // .safeParse returns three things, parsed data, true or false, error
  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({
      // 400 - bad request
      message: "Invalid inputs",
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10); //2^10 times
    const user = await client.user.create({
      data: {
        username: parsedData.data.username,
        name: parsedData.data.name,
        email: parsedData.data.email,
        password: hashedPassword,
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(409).json({
      //409 matlab conflict
      message: "User already exists with this username",
    });
  }
});

app.post("/signin", authLimiter, async function (req, res) {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "Invalid credentials",
    });
  }

  const user = await client.user.findUnique({
    where: {
      username: parsedData.data.username,
    },
  });

  if (!user) {
    return res.status(403).json({
      message: "Incorrect credentials",
    });
  } else {
    // Bcrypt will handle the comparison safely
    const passwordMatch = await bcrypt.compare(
      parsedData.data.password,
      user.password,
    );

    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      return res.json({
        token,
      });
    } else {
      return res.status(403).json({
        message: "Incorrect credentials",
      });
    }
  }
});

app.post("/room", apiLimiter, middleware, async function (req, res) {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      message: "Invalid input",
    });
    return;
  }

  const userId = req.userId; //we got this user id form middleware

  const slug = parsedData.data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") // ^ - not
    .replace(/-+/g, "-");

  try {
    const room = await client.room.create({
      data: {
        slug: slug,
        adminId: Number(userId),
      },
    });
    res.json({
      roomId: room.id,
    });
  } catch (e) {
    // console.log("The real error is here: ", e);
    console.error(e);
    res.status(409).json({
      message: "Room already exist with this name.",
    });
  }
});

app.get("/rooms", apiLimiter, middleware, async function (req, res) {
  const userId = req.userId;

  try {
    const rooms = await client.room.findMany({
      where: {
        adminId: Number(userId),
      },
      select: {
        id: true,
        slug: true,
      },
    });

    res.json({
      rooms: rooms,
    });
  } catch (e) {
    res.status(500).json({
      message: "Error fetching rooms",
      error: e,
    });
  }
});

app.get("/chats/:roomSlug", apiLimiter, middleware, async function (req, res) {
  //auth ko add karna hai
  //rate limiting add karna hai

  try {
    const roomSlug = req.params.roomSlug;
    const room = await client.room.findUnique({
      where: {
        slug: roomSlug,
      },
    });
    if (!room) {
      res.status(404).json({
        // 404 - not found
        message: "Room not found",
      });
      return;
    }
    const messages = await client.chat.findMany({
      where: {
        roomId: room.id,
      },
      orderBy: {
        id: "desc", // to get the newest first
      },
      take: 250,
    });
    res.json({
      messages: messages.reverse(),
    });
  } catch (e) {
    console.log("Room not found");
    res.status(500).json({
      messages: [],
    });
  }
});

app.listen(port, () => {
  console.log(`HTTP Server is running on port ${port}`);
});
