import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import {AuthPage, ChatSite, DashBoard, Profile} from '../pages/index'
import socket from '../api/socketClient'


function App() {

useEffect(() => { // f5 thì kết nối lại 
    socket.connect();
}, []);

  
  return (
    <>
    <BrowserRouter>
        <Routes>
          <Route path="/dashBoard" element={<DashBoard />} />
          <Route path="/profile" element={<Profile />} /> 
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
