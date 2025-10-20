import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState = {
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
}

const Auth = ({setSign}) => {
    const[signIn,setSignIn] = useState(true);
    const[form,setForm] = useState(initialState);

    const changeSign = () => {
        setSignIn(!signIn);
    }

    const handleChange = (e)=> {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = signIn
        ? "http://localhost:5000/login"
        : "http://localhost:5000/signup"

        const body = signIn
        ? {
          username: form.username,
          password: form.password,
        }
        : {
          fullName: form.fullName,
          username: form.username,
          password: form.password,
          phoneNumber: form.phoneNumber,
        };
        try {
            const res = await axios.post(url,body);
            console.log("✅ Success:", res.data);
            if(res.data.token) {
                localStorage.setItem('token', res.data.token);
                setSign(true);
            }
            if(res.data.chatToken) {
                localStorage.setItem('chatToken', res.data.chatToken);
                console.log("Chat success");
            }
        }
        catch (err) {
            console.error("❌ Error:", err.response?.data || err.message);
        }
        
        setForm(initialState);
    }

    return (
        <div className='flex bg-gradient-to-tr from-orange-50 via-orange-100 to-white'>
            <div className='w-150 flex flex-col items-center h-full ' >
            <div className= 'w-100 mt-15 text-left'>
                {signIn ? (<><h2 className='ml-5 mb-3 text-3xl font-bold mt-20'>Welcome back!</h2></>) 
                :(<>
                    <h2 className='ml-5 mb-3 text-3xl font-bold'>Keep your medical conversations organized</h2>
                </>)} 
            </div>
           
            <div className="w-150 mt-20 absolute inset-0 flex items-center justify-center ">
            <form 
                className='flex flex-col w-100 p-5'
                onSubmit={handleSubmit}
            >
                {!signIn && (
                    <>
                        <label htmlFor="fullName"
                            className='text-left'
                        >
                            Full name
                        </label>  
                        <Input
                            name="fullName"
                            placeholder="Enter your full name"
                            className="border rounded-lg p-2 mb-4"
                            onChange={handleChange}
                        />
                    </>
                )}
                    <label htmlFor="Username" className='text-left'>
                            Username
                    </label>  
                    <Input
                        name="username"
                        placeholder="Enter your username"
                        className="border rounded-lg p-2 mb-4"
                        onChange={handleChange}
                    />

                    <label htmlFor="password" className='text-left'>
                            Password
                        </label>  
                    <Input
                        name="password"
                        type='password'
                        placeholder="Enter your password"
                        className="border rounded-lg p-2 mb-4"
                        onChange={handleChange}
                    />
                {!signIn && (
                    <>
                        <label htmlFor="phonenumber" className='text-left'>
                                Phone Number
                        </label>  
                        <Input
                            name="phoneNumber"
                            placeholder="Enter your phone number"
                            className="border rounded-lg p-2 mb-4"
                            onChange={handleChange}
                        />
                    </>
                )}

                <button
                    type="submit"
                    className="!bg-amber-500"
                >
                    {signIn ? "Log in" : "Sign up"}
                </button>
                <p 
                onClick={changeSign} 
                className='cursor-pointer underline'
                >
                    {signIn ? "Chưa có tài khoản ?" : "Đã có tài khoản ?"}
                </p>
            </form>
            </div>
            </div>
            <div className="flex items-center justify-center bg-blue-50 h-screen">
                <img
                    src="../src/assets/log.svg"
                    alt="Chat illustration"
                    className="w-[770px] h-full object-cover"
                />
            </div>  
        </div>
    )
}

export default Auth