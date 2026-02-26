import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
});

// Authentication
export const login = (data) => api.post('/community/customers/login', data);
export const register = (data) => api.post('/community/customers/signup', data);

// Communities
export const getCommunities = () => api.get('/community/communities');
export const getCommunity = (id) => api.get(`/community/communities/${id}`);
export const joinCommunity = (id) => api.post(`/community/communities/${id}/join`);

// Feed
export const getPosts = () => api.get('/community/posts');
export const getPost = (id) => api.get(`/community/posts/${id}`);
export const reactToPost = (id, reaction) => api.post(`/community/posts/${id}/reaction`, { type: reaction });

// Profile
export const getProfile = () => api.get('/community/customers/me');
export const updateProfile = (data) => api.put('/community/customers/me', data);

// Dashboard
export const getDashboard = () => api.get('/community/customers/me/dashboard');
