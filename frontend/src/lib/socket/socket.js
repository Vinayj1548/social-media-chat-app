import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket Connection Error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected:", reason);
});

socket.on("reconnect", (attemptNumber) => {
  console.log(`🔄 Reconnected after ${attemptNumber} attempt(s)`);
});

socket.on("reconnect_error", (error) => {
  console.error("❌ Reconnect Error:", error.message);
});