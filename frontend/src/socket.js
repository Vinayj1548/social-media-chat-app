import { io } from "socket.io-client";

export const socket = io("https://backend-pearl-alpha.vercel.app", { transports: ["websocket"] });

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket Server:", socket.id);
});
