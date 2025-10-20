import { io } from "socket.io-client";
import { showPushNotification } from "@/lib/utils";

const user = JSON.parse(localStorage.getItem("user"));

const socket = io('http://localhost:5001', {
    transports: ["websocket"],
    autoConnect: false,
    auth: {
      token: localStorage.getItem("token"),
    },
});

socket.on('notification', (data)=> {
  console.log("receive notificaiton: ", data)
  const notification = {
    title: data.conversation_id,
    body: `${data.sender_id} has sent a message: ${data.text}`,
  }
  if (document.hidden && Notification.permission === "granted") {
    showPushNotification(notification);
  }
})

socket.on("connect", () => {
  console.log("✅ Connected to socket:", socket.id);
});

socket.on("log", (data)=> {
  console.log("Log: ",data);
})

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket");
});

export default socket