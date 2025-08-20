import axios from "axios";

const api = axios.create({
  baseURL: "http://172.20.10.2:8000/api", // replace with your backend URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;