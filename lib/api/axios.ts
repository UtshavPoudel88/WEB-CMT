import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, 
});

const getAccessTokenFromCookie = () => {
  if (typeof document === "undefined") return null;
  const tokenCookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("accessToken="));

  if (!tokenCookie) return null;
  return tokenCookie.substring("accessToken=".length);
};

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessTokenFromCookie();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;