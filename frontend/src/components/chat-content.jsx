import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowRight, ImageIcon, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import messageApi from "../../api/message/messageAPI";
import socket from "../../api/socketClient";

const MessageBubble = ({ message, isUserMessage, avatarSrc }) => (
  <div className={cn("flex items-center  ", isUserMessage ? "justify-end" : "")}>
    {!isUserMessage && (
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarSrc || "/placeholder.svg"} alt="User Avatar" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    )}
    <div
      className={cn(
        "max-w-[70%] rounded-lg p-3",
        isUserMessage ? "bg-primary text-primary-foreground rounded-br-none" : "rounded-bl-none"
      )}
    >
      <p className="text-sm text-left flex item-center break-all">{message}</p>
    </div>
  </div>
);

export default function ChatMain({currentChat}) {
  
  const [mess, setMess] = useState(currentChat?.messages?? [] );
  const currentChatUser = JSON.parse(localStorage.getItem("user"));
  const admin = currentChat?.members?.find(m => m.role === "admin");
  const message = useRef("");

  useEffect(() => {
    setMess(sortMessages(currentChat?.messages) ?? []); // cập nhật nếu prop đổi (chuyển sang con khác )
    if (message.current) message.current.value = "";
  }, [currentChat]);

  useEffect(() => {
  // Lắng nghe tin nhắn đến từ server
  socket.on("receive_message", (data) => {
    console.log("📥 Received message:", data);
    setMess((prev) => sortMessages([data, ...prev]));
  });

  return () => {
    socket.off("receive_message");
  };
}, []);



  const sortMessages = (messages = []) => {
  return [...messages].sort((a, b) => {
    const aTime = a.created_at? new Date(a.created_at).getTime() : 0;
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bTime - aTime; 
  });
}


  const handleSendMessage = async () =>{
      const data = {
        type: 'text',
        text: message.current.value.trim(),
        conversation_id: currentChat.id,
      }
      socket.emit("send_message",data);
      message.current.value = "";
  }

  if (!currentChat) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    )
  }

  return ( 
    <div className="flex flex-col rounded-lg shadow-sm flex-1 min-h-0 m-2 ">
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
                This group was created at{" "}
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
                message={msg.text}
                isUserMessage={msg.sender_id === currentChatUser.id}
                avatarSrc={currentChatUser.avatar_url}
              />
            ))
          )}
        </div>

      {/* Input area */}
      <div className="flex items-center gap-3 border-t p-4">
        <ImageIcon className="text-muted-foreground h-5 w-5 cursor-pointer" />
        <Input
          ref={message}
          placeholder="Send messages to your friends..."
          className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button size="icon" className="rounded-full" onClick ={handleSendMessage}>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
