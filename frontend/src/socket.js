import { io } from "socket.io-client";

export const socket = io("https://backend-pearl-alpha.vercel.app", {
  transports: ["websocket", "polling"], // Add polling as fallback
  reconnection: true, // Auto-reconnect on failure
  reconnectionAttempts: 5, // Try to reconnect 5 times
  reconnectionDelay: 2000, // Wait 2 seconds before retrying
});

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket Server:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});
