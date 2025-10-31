import { io } from "socket.io-client";
import { showPushNotification } from "@/lib/utils";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
  withCredentials: true,
});

socket.on("notification", (data) => {
  console.log("📩 Received notification:", data);

  const notification = {
    title: data.conversation_id,
    body: `${data.sender_id} has sent a message: ${data.text}`,
  };

  if (document.hidden && Notification.permission === "granted") {
    showPushNotification(notification);
  }
});

socket.on("connect", () => {
  console.log("✅ Connected to socket:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket");
});

socket.on("log", (data) => {
  console.log("🪵 Log:", data);
});

export default socket;
