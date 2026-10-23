
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

if (!SOCKET_URL) {
  console.error("NEXT_PUBLIC_SOCKET_URL is not configured");
}

export const socket = io(SOCKET_URL || "http://localhost:5001", {
  autoConnect: false,

  // Send the JWT required by your backend middleware.
  auth: (callback) => {
    const token = localStorage.getItem("token");
    callback({ token });
  },

  transports: ["polling", "websocket"],
  tryAllTransports: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.warn("Socket disconnected:", reason);
});
