import React, { useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import authApi from "../../api/user/auth"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { data, useNavigate } from "react-router-dom";
import socket from "../../api/socketClient";
import { requestNotificationPermission } from "@/lib/utils";

const initialState = {
  fullname: "",
  username: "",
  password: "",
  confirmPassword: "",
  phonenumber: "",
};

export function LoginForm({ className, ...props }) {
  const [signIn, setSignIn] = useState(true);
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  const changeSign = () => setSignIn(!signIn);

  const navigateToDashBoard = () => navigate('/DashBoard');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log(form);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
    
  const data = signIn
    ? {
        username: form.username,
        password: form.password,
      }
    : {
        fullname: form.fullname,
        username: form.username,
        password: form.password,
        phonenumber: form.phonenumber,
        avatar_url: 'src/assets/default_avatar.png',
      };
      console.log("data",data);
  try {
    const [res, err] = await (
      signIn
        ? authApi.login(data)
        : authApi.signup(data)
    );

    if (err) throw new Error(err);

    if (!res?.data.token) throw new Error("Thiếu token trong response!");

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));    
    console.log(JSON.parse(localStorage.getItem("user")));
    console.log("token :", res.data.token)
    socket.auth = {token: res.data.token};
    socket.connect();
    navigateToDashBoard();
    requestNotificationPermission();

  } catch (e) {
    console.error("❌ Lỗi đăng nhập:", e.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            {signIn ? "Login to your account" : "Create your account"}
          </h1>
          <p className="text-muted-foreground text-sm text-balance">
            {signIn
              ? "Enter your username and password to login"
              : "Fill the fields below to register"}
          </p>
        </div>

        {!signIn && (
          <Field>
            <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
            <Input
              id="fullname"
              name="fullname"
              placeholder="Enter your full name"
              onChange={handleChange}
              required
            />
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            name="username"
            placeholder="Enter your username"
            onChange={handleChange}
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />
        </Field>

        {!signIn && (
          <Field>
            <FieldLabel htmlFor="phonenumber">Phone Number</FieldLabel>
            <Input
              id="phonenumber"
              name="phonenumber"
              placeholder="Enter your phone number"
              onChange={handleChange}
              required
            />
          </Field>
        )}

        <Field>
          <Button type="submit" disabled={loading} className='bg-[#df6900]'>
            {loading
              ? "Please wait..."
              : signIn
              ? "Login"
              : "Sign up"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 mr-2"
            >
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 
                  0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 
                  0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61 
                  C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 
                  1.205.084 1.838 1.236 1.838 1.236 
                  1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605 
                  -2.665-.3-5.466-1.332-5.466-5.93 
                  0-1.31.465-2.38 1.235-3.22 
                  -.135-.303-.54-1.523.105-3.176 
                  0 0 1.005-.322 3.3 1.23 
                  .96-.267 1.98-.399 3-.405 
                  1.02.006 2.04.138 3 .405 
                  2.28-1.552 3.285-1.23 3.285-1.23 
                  .645 1.653.24 2.873.12 3.176 
                  .765.84 1.23 1.91 1.23 3.22 
                  0 4.61-2.805 5.625-5.475 5.92 
                  .42.36.81 1.096.81 2.22 
                  0 1.606-.015 2.896-.015 3.286 
                  0 .315.21.69.825.57 
                  C20.565 22.092 24 17.592 24 12.297 
                  c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>

          <FieldDescription className="text-center">
            {signIn ? (
              <>
                Don’t have an account?{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={changeSign}
                >
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={changeSign}
                >
                  Login
                </span>
              </>
            )}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
