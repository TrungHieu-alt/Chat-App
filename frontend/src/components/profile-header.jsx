import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Calendar, Mail, MapPin, Dot } from "lucide-react";

export default function ProfileHeader({user}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url} alt="Profile" />
              <AvatarFallback className="text-4xl">
                {user.fullname.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full">
              <Camera />
            </Button>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{user.fullname}</h1>
              <Badge variant="secondary">Pro Member</Badge>
            </div>
            <div>
              
            </div>
            <div className="flex">
              <Dot className="text-[#00C951] stroke-8"/>
              <p className="text-muted-foreground">Online</p>

            </div>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {user.email || "######@###"}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="size-4" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                 {`Joined ${user.created_at}`}
              </div>
            </div>
          </div>
          <Button variant="default" type="submit" form="profileForm">Edit Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}
