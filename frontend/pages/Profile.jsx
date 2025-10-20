import React from "react";
import { IconBar } from "@/components/IconBar";
import ChatMain from "@/components/chat-content";
import { useState } from "react";
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
import ProfileHeader from "@/components/profile-header";
import ProfileContent from "@/components/profile-content";
import { ResetPasswordForm } from "@/components/resetPasswordForm";

export default function Profile() {
  const [openPassword, setOpenPassword] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    
    <SidebarProvider>
      <IconBar user = {user} />
      <SidebarInset className="flex flex-col min-h-0">
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 w-full z-50">
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
        <ProfileHeader user={user}/>
        <ProfileContent user={user} onOpen={()=>{setOpenPassword(true)}}/>
      </SidebarInset>
      <ResetPasswordForm open={openPassword} onOpenChange={setOpenPassword}/>
    </SidebarProvider>
  );
}
