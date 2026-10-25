import { io } from "socket.io-client";

let socket = null;

function getSocketUrl() {
  // Production: use the current HTTPS website domain.
  if (import.meta.env.PROD) {
    return window.location.origin;
  }

  // Local development.
  return import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
}

export function connectSocket() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  if (socket) {
    socket.auth = { token };

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  socket = io(getSocketUrl(), {
    path: "/socket.io/",
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("[SOCKET] Connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("[SOCKET ERROR]", error.message);
  });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
