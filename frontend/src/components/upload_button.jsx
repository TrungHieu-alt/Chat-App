"use client";

import React, { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageIcon } from "lucide-react";
import s3Api from "../../api/s3/s3API";

export function UpButton({ onUploadComplete }) {
  const mediaInputRef = useRef(null);
  const gifInputRef = useRef(null);

  const handleMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const [res, err] = await s3Api.upload(file);
      if (err) throw err;

      const media = res.data.data; // { s3_key, s3_url, file_name, ... }
      console.log("✅ Uploaded:", media);

      // Gửi cho component cha (ChatMain)
      onUploadComplete?.(media);
    } catch (error) {
      console.error("❌ Upload failed:", error);
    } finally {
      e.target.value = ""; // reset input
    }
  };

  const handleGifUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const [res, err] = await s3Api.upload(file);
    if (!err) onUploadComplete?.(res.data.data);
    e.target.value = "";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ImageIcon className="text-muted-foreground h-5 w-5 cursor-pointer" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Upload Media</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => mediaInputRef.current?.click()}>
          Files
          <span className="ml-auto text-xs text-muted-foreground">Media</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => gifInputRef.current?.click()}>
          GIF
          <span className="ml-auto text-xs text-muted-foreground">.gif</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Hidden inputs */}
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={handleMediaUpload}
        className="hidden"
      />
      <input
        ref={gifInputRef}
        type="file"
        accept=".gif,image/gif"
        onChange={handleGifUpload}
        className="hidden"
      />
    </DropdownMenu>
  );
}
