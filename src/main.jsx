import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Fix for globals if needed by libraries
if (typeof window !== 'undefined') {
  window.global = window;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = apiUrl;
console.log(`[APP] Connecting to: ${apiUrl}`);
console.log(`[APP] Build Date: ${new Date().toLocaleString()}`);


// Add token to all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Logout on 401
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
