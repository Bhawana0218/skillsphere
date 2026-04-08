import { io, type Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
  transports: ["websocket"],
  auth: {
    token: localStorage.getItem("token") || "",
  },
});

export default socket;
