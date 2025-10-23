import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const baseClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function handleRequest(promise) {
  try {
    const res = await promise;
    return [res, null];
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    console.error("API error:", message);
    return [null, message];
  }
}

baseClient.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  } else {
    delete req.headers.Authorization;
    console.warn("⚠️ Token not found");
  }
  return req;
});

export default { baseClient, handleRequest };
