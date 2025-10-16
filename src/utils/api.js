// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3003/api",
  // "/api"
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // or sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
