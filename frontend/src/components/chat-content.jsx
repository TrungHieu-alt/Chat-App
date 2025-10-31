import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import socket from "../../api/socketClient";
import { UpButton } from "./upload_button";

// ========================================
// 💬 Message Bubble Component
// ========================================
const MessageBubble = ({ message, isUserMessage, avatarSrc }) => {
  const isMedia = message.type === "media";
  const isImage = message.attachment_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = message.attachment_url?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
  const isAudio = message.attachment_url?.match(/\.(mp3|wav|ogg)$/i);

  return (
    <div className={cn("flex items-center", isUserMessage ? "justify-end" : "")}>
      {!isUserMessage && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="User Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3",
          isUserMessage
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-secondary rounded-bl-none"
        )}
      >
        {isMedia ? (
          <>
            {isImage && (
              <img
                src={message.attachment_url}
                alt={message.attachment_meta?.file_name || "image"}
                className="rounded-md max-w-[250px] mb-1"
              />
            )}
            {isVideo && (
              <video
                controls
                src={message.attachment_url}
                className="rounded-md max-w-[250px] mb-1"
              />
            )}
            {isAudio && (
              <audio controls src={message.attachment_url} className="w-full mb-1" />
            )}
            {!isImage && !isVideo && !isAudio && (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-500 break-all"
              >
                {message.attachment_meta?.file_name || "Download file"}
              </a>
            )}
          </>
        ) : (
          <p className="text-sm text-left flex items-center break-all">{message.text}</p>
        )}
      </div>
    </div>
  );
};

// ========================================
// 💬 Chat Main Component
// ========================================
export default function ChatMain({ currentChat }) {
  const [mess, setMess] = useState(currentChat?.messages ?? []);
  const currentChatUser = JSON.parse(localStorage.getItem("user"));
  const admin = currentChat?.members?.find((m) => m.role === "admin");
  const message = useRef("");

  // 🔹 Sắp xếp tin nhắn (mới nhất ở trên vì flex-col-reverse)
  const sortMessages = (messages = []) => {
    return [...messages].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime; // newest first
    });
  };

  useEffect(() => {
    setMess(sortMessages(currentChat?.messages) ?? []);
    if (message.current) message.current.value = "";
  }, [currentChat]);

  // 🔹 Socket listener
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("📥 Received message:", data);
      setMess((prev) => sortMessages([data, ...prev])); // prepend vì flex-col-reverse
    });
    return () => socket.off("receive_message");
  }, []);

  // 🔹 Gửi tin nhắn text
  const handleSendMessage = () => {
    const text = message.current.value.trim();
    if (!text) return;
    const data = {
      type: "text",
      text,
      conversation_id: currentChat.id,
    };
    socket.emit("send_message", data);
    message.current.value = "";
  };

  // 🔹 Khi upload media xong thì gửi message kiểu media
  const handleUploadComplete = (media) => {
    socket.emit("send_message", {
      type: "media",
      conversation_id: currentChat.id,
      attachment_url: media.s3_url,
      attachment_meta: {
        file_name: media.file_name,
        file_type: media.file_type,
        file_size: media.file_size,
      },
    });
  };

  if (!currentChat) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg shadow-sm flex-1 min-h-0 m-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b py-2 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={currentChat.avatar_url || "/placeholder.svg"}
              alt={currentChat.name}
            />
            <AvatarFallback>{currentChat.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{currentChat.name}</h2>
            <p className="text-muted-foreground text-sm">{currentChat.status}</p>
          </div>
        </div>
        <MoreVertical className="text-muted-foreground h-5 w-5 cursor-pointer" />
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col-reverse space-y-reverse space-y-4 overflow-y-auto p-6 min-h-0">
        {mess.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <p className="text-lg font-semibold">Start the conversation</p>
            <p className="text-sm mt-1">
              This group was created by{" "}
              <span className="font-medium text-foreground">
                {admin?.fullname || "someone"}
              </span>
              .
            </p>
          </div>
        ) : (
          mess.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isUserMessage={msg.sender_id === currentChatUser.id}
              avatarSrc={currentChatUser.avatar_url}
            />
          ))
        )}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-3 border-t p-4">
        <UpButton onUploadComplete={handleUploadComplete} />
        <Input
          ref={message}
          placeholder="Send messages to your friends..."
          className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button size="icon" className="rounded-full" onClick={handleSendMessage}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
