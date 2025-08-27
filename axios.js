import axios from "axios";

const api = axios.create({
  baseURL: "https://ludobackend-1-sguh.onrender.com/api", // replace with your backend URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;