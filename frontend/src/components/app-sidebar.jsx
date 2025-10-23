import * as React from "react";
import {
  ArchiveX,
  Shell,
  UsersRound,
  MessageSquareDot,
  PencilLine,
  Trash2,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavUser } from "@/components/nav-user";
import { CreateNewChat } from "./createChat";
import { Label } from "@/components/ui/label";
import { ChatList } from "../../myComponents/ConversationList";
import { Link } from "react-router-dom";
import socket from "../../api/socketClient";
import conversationApi from "../../api/conversation/conversation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { normalizeDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
const data = {
  navMain: [
    {
      title: "Inbox",
      url: "#",
      icon: MessageSquareDot,
      isActive: true,
    },
    {
      title: "Group",
      url: "#",
      icon: UsersRound,
      isActive: false,
    },
    {
      title: "Junk",
      url: "#",
      icon: ArchiveX,
      isActive: false,
    },
    {
      title: "New chat",
      url: "#",
      icon: PencilLine,
      isActive: false,
    },
    {
      title: "Logout",
      url: "/auth",
      icon: LogOut,
      isActive: false,
    },
  ],
};

export function AppSidebar({ handleSelectChat }) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setOpen } = useSidebar();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  const sortConversations = (conversations = []) => {
    return [...conversations].sort((a, b) => {
      const aTime = a.last_message_time
        ? new Date(a.last_message_time).getTime()
        : 0;
      const bTime = b.last_message_time
        ? new Date(b.last_message_time).getTime()
        : 0;
      return bTime - aTime;
    });
  };

  
  const fetchConversations = async () => {
    try {
      const [res, err] = await conversationApi.getMyConversations();
      if (err) throw new Error(err);
      setConversations(sortConversations(res.data));
      console.log(res.data);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách conversation:", e.message);
    }
  };

  
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleConnected = () => {
      const t = setTimeout(() => {
        fetchConversations();
      }, 120);
      return () => clearTimeout(t);
    };
    socket.on("connect", handleConnected);
    return () => {
      socket.off("connect", handleConnected);
    };
  }, []);

  useEffect(() => {
    socket.on("onConversation", (data) => {
      console.log("A user add you to his new chat", data);
      setConversations((prev) => [data, ...prev]);
    });

    socket.on("notification", (data) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === data.conversation_id);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          last_message_text: data.text ?? updated[index].last_message_text,
          last_message_time:
            data.created_at ?? updated[index].last_message_time,
          unread: true,
        };
        return sortConversations(updated);
      });
    });

 socket.on("user_status_change", ({ user_id, status }) => {
  console.log("user status changed\n", user_id, status);
    setConversations(prev => {
      return prev.map(c => {
        console.log("c:", c)
        // Kiểm tra xem user có nằm trong members của conversation không
        if (!c.members || !c.members.includes(user_id)) return c;

        let newCount = c.online_count || 0;
        if (status === "online") {
          newCount = newCount + 1;
        } else if (status === "offline") {
          newCount = Math.max(newCount - 1, 0);
        // console.log(c.id, newCount);
        }
        return { ...c, online_count: newCount };
      });
    });
  });

    return () => {
      socket.off("notification");
      socket.off("onConversation");
      socket.off("user_status_change");
    };
  }, [socket]);

  const handleClick = (item) => {
    if (item.title === "Logout") {
      localStorage.removeItem("token");
      navigate(item.url);
      if (socket.connected) socket.disconnect();
    }
    if (item.title === "New chat") {
      setIsDialogOpen(true);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row z-50 "
    >
      {/* Sidebar 1 */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)] border-r bg-background-xl "
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link to="/dashBoard">
                  <div className="bg-[#c37f00] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Shell className="size-4 text-black" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item);
                        setOpen(true);
                        handleClick(item);
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="flex items-center justify-items-center">
          <Link to="/profile" className="rounded-full overflow-hidden w-7 h-7">
             <Avatar >
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.fullname.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
          </Link>
        </SidebarFooter>
      </Sidebar>

      {/* Sidebar 2 */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex bg-background m-2">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-medium">
              {activeItem?.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              <ChatList
                chats={conversations.map((c, idx) => ({
                  id: c.id,
                  name: c.name,
                  avatar: c.avatar_url || "/placeholder.svg",
                  lastMessage: c.last_message_text,
                  timestamp: normalizeDate(c.last_message_time),
                  unread: c.unread ? 1 : 0,
                  online: c.online_count > 1,
                }))}
                selectedChat={null}
                onSelect={(chat) => handleSelectChat(chat)}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <CreateNewChat
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        createConversation={(newConvo) => {
          setConversations((prev) => [newConvo, ...prev]);
        }}
      />
    </Sidebar>
  );
}
