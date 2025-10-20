import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import shell from "../assets/shell.svg";
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const normalizeDate = (isoString) =>{
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();

  const isSameDay = date.toDateString() === now.toDateString();

  // Hôm qua
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  // Khoảng cách ngày
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (isSameDay) {
    // Hôm nay → chỉ hiển thị giờ và phút
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // đổi sang true nếu muốn kiểu 9:45 PM
    });
  } else if (isYesterday) {
    return "Yesterday";
  } else if (diffDays < 7) {
    // Trong tuần → hiển thị thứ
    return date.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Mon"
  } else {
    // Xa hơn → hiển thị ngày/tháng
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });
  }
} 

export const requestNotificationPermission = () => {
  if(Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export const showPushNotification = (data, onClick) => {
  if(Notification.permission !== "granted") return console.log("Notification: no permission")
  try {
      const {title, body} = data;
      const newNotif = new Notification(title,{body});
      newNotif.onclick = () => {
      window.focus(),
      onClick && onClick();
    }
  } catch (error) {
    console.log(error)
  };
    
}