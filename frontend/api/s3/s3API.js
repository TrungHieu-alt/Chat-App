import axios from "axios";
import { handleRequest } from "../baseClient";
const API_URL = import.meta.env.VITE_API_URL;

const s3Api = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    return handleRequest(
      axios.post(`${API_URL}/s3/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
    );
  },
};

export default s3Api;
