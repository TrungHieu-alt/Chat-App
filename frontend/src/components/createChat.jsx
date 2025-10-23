"use client"

import { useState,useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, Search, Check, MessageSquare, Users, X } from "lucide-react"
import userApi from "../../api/user/user"
import conversationApi from "../../api/conversation/conversation"
import socket from "../../api/socketClient"

export function CreateNewChat({ open, onOpenChange, createConversation }) {
  const [chatName, setChatName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState(new Set())
  const [chatAvatar, setChatAvatar] = useState(null)
  const [otherUsers, setOtherUsers] = useState([])


   useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, err] = await userApi.getOtherUsers();
        if (err) throw new Error(err);
        
        setOtherUsers(res.data);
      } catch (e) {
        console.error("❌ Có lỗi khi lấy danh sách user:", e.message);
      } 
      
    }
    fetchData()
  }, []) 

  const filteredUsers = otherUsers.filter((user) =>user.fullname.toLowerCase().includes(searchQuery.toLowerCase()))



  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const clearAllSelections = () => {
    setSelectedUsers(new Set())
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setChatAvatar(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setChatName("")
    setSearchQuery("")
    setSelectedUsers(new Set())
    setChatAvatar(null)
  }

  const handleCreateChat = async () => {
    const data = {
      name: chatName,
      avatar_url: chatAvatar,
      members: Array.from(selectedUsers),
      type: selectedUsers.size === 1 ? "inbox" : "group",
    }

    try {
       const [res,err] = await conversationApi.createNewConversation(data); // tạo bản ghi trong db 
       const newConversation = {
          id: res.data.conversation_id,
          ...data,
          last_message_time: new Date().toISOString(),
       }
       socket.emit("createConversation", newConversation);
       createConversation({...newConversation, members: [...newConversation.members, JSON.parse(localStorage.getItem("user")).id]}); // gửi prop cho cha cập nhật
       if(err) throw new Error(err);
    } catch (e) {
      console.error("Lỗi tạo conversation: ", e.message);
    }
   
    resetForm()
  }

  const getChatType = () => {
    if (selectedUsers.size === 0) return null
    return selectedUsers.size === 1 ? "inbox" : "group"
  }

  const canCreateChat = chatName.trim() !== "" && selectedUsers.size >= 1
  const chatType = getChatType()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">Create New Chat</DialogTitle>
              <DialogDescription className="mt-1">Start a conversation with your friends</DialogDescription>
            </div>
            {chatType && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                {chatType === "inbox" ? (
                  <MessageSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Users className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-semibold uppercase text-primary">{chatType}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={chatAvatar || "/default-chat-avatar.jpg"} />
                  <AvatarFallback>GC</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="flex-1">
                <label htmlFor="chat-name" className="text-sm font-medium text-foreground">
                  Chat Name
                </label>
                <Input
                  id="chat-name"
                  placeholder="Enter chat name..."
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* User List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">Select people to add</p>
                {selectedUsers.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-xs font-medium text-primary">
                      {selectedUsers.size} {selectedUsers.size === 1 ? "person" : "people"}
                    </span>
                    <button
                      onClick={clearAllSelections}
                      className="h-4 w-4 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors"
                      aria-label="Clear all selections"
                    >
                      <X className="h-3 w-3 text-primary" />
                    </button>
                  </div>
                )}
              </div>
              <ScrollArea className="h-[300px] rounded-md border border-border">
                <div className="p-2 space-y-1">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.has(user.id)
                    return (
                      <button
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isSelected ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-accent"
                        }`}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.fullname} />
                            <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {(user.status === 'online') && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-foreground">{user.fullname}</p>
                          <p className="text-xs text-muted-foreground">{(user.status === 'online') ? "Active now" : "Offline"}</p>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Create Button */}
            <Button onClick={handleCreateChat} disabled={!canCreateChat} className="w-full">
              Create Chat
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
