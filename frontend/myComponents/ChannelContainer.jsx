import React from 'react'
import { useState,useEffect } from 'react'
import { Channel,Window, ChannelHeader, MessageList, MessageInput, Thread } from 'stream-chat-react'
import avatar from '../src/assets/avatar.png'
import { io } from 'socket.io-client';
const socket = io("http://localhost:5001");

const ChannelContainer = () => {

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', message);
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, []);
  return (
      <>
          <div className=" flex flex-col w-250 h-screen">
            <div className="flex justify-between">
              <div className="flex">
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-18"
                />
                <div className="flex flex-col justify-center">
                  <p className="text-left">Earth SAVIOR</p>
                  <p className="text-sm text-left">Online</p>
                </div>
              </div>
              <div className="chat-actions">
                <button>📞</button>
                <button>🎥</button>
                <button>⋮</button>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1">
              <div>
                {messages.map((msg, index) => (
                  <p key={index}>{msg}</p>
                ))}
              </div>
            </div>

            {/* INPUT BAR */}
            <div className="chat-input">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={sendMessage}>Gửi</button>
            </div>
          </div>

      </>
  )
}

export default ChannelContainer