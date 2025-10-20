import axios from "axios";
export const baseClient = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {                            
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

export async function handleRequest(promise) {
  try {
    const res = await promise
    return [res, null] 
  } catch (err) {
    const message = err.response?.data?.message || err.message
    console.error("API error:", message)
    return [null, message]
  }
}

baseClient.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if(token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    else {
      delete req.headers.Authorization;
      console.log("token not found");
    }
    return req;
});


export default {baseClient, handleRequest}