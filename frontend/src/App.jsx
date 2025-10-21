import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import {AuthPage, CreateCon, DashBoard, Profile} from '../pages/index'
import socket from '../api/socketClient'


function App() {

useEffect(() => { // f5 thì kết nối lại 
  const token = localStorage.getItem("token");
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
}, []);



  return (
    <>
    <BrowserRouter>
        <Routes>
          <Route path="/dashBoard" element={<DashBoard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/create" element={<CreateCon />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
