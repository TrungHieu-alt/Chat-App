import React from "react";
import { Shell } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function AuthPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-[#df6900] text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Shell className="size-4" />
            </div>
            Medical Chat
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm/>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <img
          src="../src/assets/login.jpg"
          alt="Login illustration"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
