import * as React from "react"
import { Shell, MessageCircle, UsersRound, MessageSquareDot, ArchiveX, LogOut } from "lucide-react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const data = {
  navMain: [
    { title: "Inbox", icon: MessageCircle },
    { title: "Group", icon: UsersRound },
    { title: "Unread", icon: MessageSquareDot },
    { title: "Junk", icon: ArchiveX },
    { title: "Logout", icon: LogOut, url: "/auth" },
  ],
}

export function IconBar({user}) {
  const [activeItem, setActiveItem] = React.useState('');
  const { setOpen } = useSidebar()
  const navigate = useNavigate();

  
  const handleClick = (item) => {
    if(item.title === "Logout") {
      localStorage.removeItem("token");
      navigate(item.url);
      if(!localStorage.token) {
        console.log("delete token");
      }
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className={`
        bg-background-xl border-r transition-transform duration-300
        fixed inset-y-0 left-0 z-50
        data-[state=open]:translate-x-0
        data-[state=closed]:-translate-x-full
        md:translate-x-0
      `}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0 hover:bg-transparent active:bg-transparent">
              <Link to='/dashBoard'>
                <div className="bg-[#c37f00] flex aspect-square size-8 items-center justify-center rounded-lg">
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
                    tooltip={{ children: item.title }}
                    isActive={activeItem?.title === item.title}
                    onClick={() => {
                      setActiveItem(item)
                      setOpen(true) 
                      handleClick(item);
                    }}
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

      <SidebarFooter className='flex flex-row' >
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
  )
}
