import { io, Socket } from "socket.io-client";

const SOCKET_URL =
   process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

let socket: Socket | null = null;

export const getSocket = (token: string | null): Socket => {
   if (!socket) {
      socket = io(SOCKET_URL, {
         auth: { token },
         reconnection: true,
         reconnectionAttempts: 5,
         reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
         console.log("Connected to Socket.IO server");
      });

      socket.on("disconnect", (reason) => {
         console.log("Disconnected:", reason);
      });

      socket.on("error", (err) => {
         console.error("Socket error:", err);
      });
   }
   return socket;
};
