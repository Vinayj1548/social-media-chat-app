import { io } from "socket.io-client";

export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL,
  {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  }
);

try {
  socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);
  });
}catch (error) {
  console.error("❌ Socket connection error:", error);
}


socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
});