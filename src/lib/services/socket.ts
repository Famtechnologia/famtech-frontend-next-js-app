import { io, Socket } from "socket.io-client";

export const initSocket = (id: string) => {
  const socket = io("http://localhost:4000/user", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    autoConnect: true, // transports: ['websocket'], // Uncomment if you want to force WebSocket transport
    auth: {
      userId: id,
    },
  }) as Socket;

  socket.on("connect", () => {
    console.log("User connected to backend");
  });

  // Send message to support
  const askForHelp = (text: string) => {
    socket.emit("send_to_support", text);
  };

  // Receive reply from admin
  socket.on("support_message", (data) => {
    console.log("Support says:", data.message);
  });

  return { socket, askForHelp };
};
// Explicitly connect to the backend URL + namespace
