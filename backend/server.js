import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const server = createServer(app);

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5001",
  "https://social-media-chat-app-gilt.vercel.app",
  "https://social-media-chat-app-0xfh.onrender.com",
];

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {

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

// Socket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (
    typeof token !== "string" ||
    !process.env.JWT_SECRET
  ) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

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

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Each user receives messages through their own room.
  socket.join(socket.data.userId);

  socket.on("sendMessage", (msgData, acknowledge) => {
    const fail = (message) => {
      if (typeof acknowledge === "function") {
        acknowledge({
          ok: false,
          error: message,
        });
      }
    };

    // Validate text messages.
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

    // Reject empty messages.
    if (!msgData.text.trim()) {
      fail("A message is required.");
      return;
    }

    const messageData = {
      text: msgData.text,
      senderID: socket.data.userId,
      senderName:
        typeof msgData.senderName === "string"
          ? msgData.senderName.slice(0, 80)
          : "",
      receiverID: msgData.receiverID,
    };

    // Deliver the text message to the recipient.
    io.to(msgData.receiverID).emit(
      "receiveMessage",
      messageData
    );

    // Acknowledge successful delivery to the socket handler.
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

// Database connection
connectDB();

// Express CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
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

// Server listening
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
