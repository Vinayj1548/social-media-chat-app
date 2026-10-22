import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import {errorHandler} from "./middleware/errorMiddleware.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const server = createServer(app);

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5001",
  "https://social-media-chat-app-gilt.vercel.app"
];
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// Socket.IO
const io = new Server(server, {
  maxHttpBufferSize: 16 * 1024 * 1024,
  cors: {
    origin: (origin, callback) => {
      console.log("Socket Origin:", origin);

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (typeof token !== "string" || !process.env.JWT_SECRET) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (
      typeof payload === "string" ||
      typeof payload.id !== "string" ||
      !/^[a-f\d]{24}$/i.test(payload.id)
    ) {
      next(new Error("Invalid authentication token"));
      return;
    }

    socket.data.userId = payload.id;
    next();
  } catch {
    next(new Error("Invalid authentication token"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.join(socket.data.userId);

  socket.on("sendMessage", (msgData, acknowledge) => {
    const fail = (message) => {
      if (typeof acknowledge === "function") {
        acknowledge({ error: message });
      }
    };

    if (
      !msgData ||
      typeof msgData !== "object" ||
      typeof msgData.receiverID !== "string" ||
      !/^[a-f\d]{24}$/i.test(msgData.receiverID) ||
      msgData.receiverID === socket.data.userId ||
      typeof msgData.text !== "string" ||
      msgData.text.length > 5000
    ) {
      fail("Invalid message.");
      return;
    }

    const attachments = msgData.attachments ?? [];
    if (!Array.isArray(attachments) || attachments.length > 10) {
      fail("Invalid attachments.");
      return;
    }

    let totalBytes = 0;
    for (const attachment of attachments) {
      if (
        !attachment ||
        typeof attachment.name !== "string" ||
        attachment.name.length === 0 ||
        attachment.name.length > 255 ||
        typeof attachment.type !== "string" ||
        attachment.type.length > 127 ||
        typeof attachment.size !== "number" ||
        !Number.isSafeInteger(attachment.size) ||
        typeof attachment.data !== "string"
      ) {
        fail("Invalid attachment.");
        return;
      }

      const dataUrl = /^data:[^;,]+;base64,([A-Za-z\d+/]*={0,2})$/.exec(
        attachment.data,
      );
      if (!dataUrl) {
        fail("Invalid attachment data.");
        return;
      }

      const fileBytes = Buffer.from(dataUrl[1], "base64");
      if (
        fileBytes.toString("base64") !== dataUrl[1] ||
        fileBytes.length !== attachment.size
      ) {
        fail("Invalid attachment data.");
        return;
      }

      totalBytes += fileBytes.length;
      if (totalBytes > MAX_ATTACHMENT_BYTES) {
        fail("Attachments exceed the 10 MB total limit.");
        return;
      }
    }

    if (msgData.text.trim() === "" && attachments.length === 0) {
      fail("A message or attachment is required.");
      return;
    }

    io.to(msgData.receiverID).emit("receiveMessage", {
      text: msgData.text,
      senderID: socket.data.userId,
      senderName:
        typeof msgData.senderName === "string"
          ? msgData.senderName.slice(0, 80)
          : "",
      receiverID: msgData.receiverID,
      attachments,
    });
    if (typeof acknowledge === "function") {
      acknowledge({ ok: true });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection
connectDB();

// Express CORS
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin);

      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use(errorHandler);

// Server Listening
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});