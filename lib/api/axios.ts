import axios from "axios";



const axiosInstance = axios.create({
  // Backend (Express) on 3000; Next.js dev on 3001
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // allow cookies for auth
});

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  
  // First try cookie
  const tokenCookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("accessToken="));
  
  if (tokenCookie) {
    return tokenCookie.substring("accessToken=".length);
  }
  
  // Fallback to localStorage
  return localStorage.getItem("token");
};

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;