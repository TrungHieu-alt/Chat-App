import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import ChatMain from "@/components/chat-content";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import conversationApi from "../api/conversation/conversation";
import socket from "../api/socketClient";

export default function Page() {

  const [currentChat,setCurrentChat] =  useState ();
  const handleSelectChat = async (chat) => {
    
    try {
      const [res, err] = await conversationApi.getConversationMessages(chat.id)
      if(err) throw new Error(err.message);
      setCurrentChat({
        ...res.data,
         id: chat.id,
        avatar_url: chat.avatar,
        name : chat.name
      });
      socket.emit("join_room",chat.id)
      console.log("current chat", currentChat)
    } catch (error) {
      console.log("error when get current conversation: ", error)
    }
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" }} className='h-screen flex ' >
      <AppSidebar handleSelectChat={handleSelectChat} />
      <SidebarInset className="flex flex-col min-h-0">
        <header className="bg-background sticky top-0 flex shrink-0 items-center m-1 gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Inbox</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <ChatMain currentChat={currentChat}/>
      </SidebarInset>
    </SidebarProvider>
  );
}
