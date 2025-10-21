# Chat-App
A full-stack real-time chat application, built with Node.js, Express, MySQL, Socket.IO, and React (Vite + Tailwind + Shadcn UI). Supports authentication, conversation management, and instant messaging with online/offline status tracking.
# 💬 Medical Chat — Real-time Messaging Platform

A modern, secure, and scalable chat application designed for **real-time doctor–patient communication**.  
Built with **Node.js, Express, MySQL, Socket.IO, and React/Vite**, and deployed on **AWS EC2 + Cloudflare SSL**.



## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Shadcn/UI + Lucide Icons |
| **Backend** | Node.js 20 + Express + Socket.IO |
| **Database** | MySQL 8 (UUID-based schema, soft-delete triggers, relational joins) |
| **Deployment** | AWS EC2 (Ubuntu 24.04), Nginx reverse proxy, Cloudflare DNS/SSL |
| **Auth** | JWT + bcrypt password hashing |
| **Realtime** | Socket.IO (room-based per `conversation_id` & user notifications) |

---

## Architecture Overview

```
Frontend (React/Vite)
       │
       ▼
REST API + Socket.IO Gateway (Express)
       │
       ▼
MySQL  (users, messages, conversations, members)
```

### Key Concepts

- **Room-based Socket Architecture**  
  Each conversation has a unique Socket.IO room → real-time messaging and typing indicators.  
  Users also join personal notification rooms for system events.

- **Soft Delete & Triggers**  
  Users tables include `deactivated_at` for reversible deletes.  
  DB triggers maintain `online_count` in `conversations_members`.

- **Service-Oriented Codebase**  
  `routes/ → controllers/ → config/pool.js`  

---

## Folder Structure

```
backend/
├── config/
│   └── pool.js              # MySQL connection pool
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── conversationController.js
│   └── messageController.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── conversationRoutes.js
│   └── messageRoutes.js
├── sockets/
│   └── index.js             # socket event handlers
├── utils/
│   └── jwt.js               # JWT helpers
└── server.js
```

```
frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── myComponents/
│   └── main.jsx
└── vite.config.js
```

---

## Environment Variables

### Backend `.env`
```
JWT_SECRET=hieu

DB_HOST=localhost
DB_USER=root
DB_NAME=chatdb
DB_PORT=3306
DB_PASS=1234
```


---

## Database Schema (Simplified)

```
users (id, username, fullname, avatar, bio, role, status, created_at, deactivated_at)
conversations (id, name, created_at, updated_at)
conversation_members (conversation_id, user_id, joined_at, online_count)
messages (id, conversation_id, sender_id, content, type, created_at, deactivated_at)
```

> Note: Uses UUIDv4 as primary keys for distributed scalability.

---

## Key Features

- JWT authentication + role-based access
- Real-time messaging with Socket.IO
- Online/offline tracking via triggers
- Soft delete (reversible) for messages/conversations
- User profiles with avatar + bio
- Push notifications (browser Notification API)
- Scalable architecture, can easily convert to MVC

---

## Setup Guide

### 1️ Backend
```
cd backend
npm install
npm run dev
```

### 2️ Frontend
```
cd frontend
npm install
npm run dev
```

### 3️ Socket.io
```
cd backend
npm run socket
```

---

## Deployment

1. **Provision EC2 (Ubuntu 24.04)**  
   - Install Node.js 20, MySQL 8, Nginx  
   - Use `pm2` for process management

2. **Set up Cloudflare**  
   - Proxy + SSL + DNS (A record → EC2 IP)

3. **Reverse Proxy Example**
```
server {
  server_name yourdomain.com;

  location /api {
    proxy_pass http://localhost:5001;
  }

  location /socket.io/ {
    proxy_pass http://localhost:5001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
  }

  location / {
    root /var/www/frontend/dist;
    try_files $uri /index.html;
  }
}
```

---

## Scalability Notes

- Easily extendable to **microservices** with message queues (e.g., RabbitMQ)
- Could integrate **AI-powered assistants** (Gemini or GPT) for message summarization
- Next steps: **RAG integration** for contextual recommendations
- Convert to MVC architech when need more scalability
---

## 👤 Author

**Trung Hieu**  
👨‍💻 GitHub: [TrungHieu-alt](https://github.com/TrungHieu-alt)  
💬 Contact: nguyentrunghieu24112004@gmail.com  
🎓 UET — Vietnam National University (2022-2026)

---

## Future Roadmap

- File sharing & media messages  
- End-to-end encryption  
- AI conversation summaries  

---

