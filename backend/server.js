import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import {createServer} from "node:http";
import { Server } from "socket.io";

// Using cors 




dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server , {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5000" , "https://backend-pearl-alpha.vercel.app"],
    methods: ["GET", "POST" , "PUT" , "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (msgData) => {
    io.emit("receiveMessage", msgData); // Broadcast message to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const allowedOrigins = [
  "http://localhost:5173", // Vite frontend
  "http://localhost:5000", // React frontend
  "https://backend-pearl-alpha.vercel.app", // vercel domain
];




// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use(cookieParser());

// Database Connection
connectDB();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies or authentication headers
  })
);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/" , userRoutes)

// Server Listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

