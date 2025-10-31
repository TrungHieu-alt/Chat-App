import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const baseClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
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


export default { baseClient, handleRequest };
