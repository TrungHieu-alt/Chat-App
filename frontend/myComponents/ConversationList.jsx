import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function ChatList({ chats, selectedChat, onSelect }) {
  if (!chats || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">No chats found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto flex-shrink-0 min-w-[280px] max-w-[290px] w-full">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelect(chat)}
          className={cn(
            "hover:bg-sidebar-accent flex w-full items-center gap-3 border-b p-3 text-left transition-colors last:border-b-0",
            selectedChat?.id === chat.id && "bg-sidebar-accent"
          )}
        >
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.avatar || "/placeholder.svg"} alt={chat.name} />
              <AvatarFallback>
                {chat.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {chat.online ? (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-sidebar" />
            ) :
              (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-sidebar" />
            ) 
          }
          </div>

          <div className="flex-1 overflow-hidden min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate">{chat.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{chat.timestamp}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground truncate flex-1">{chat.lastMessage}</p>
              {chat.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground px-1.5 flex-shrink-0">
                  {chat.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
