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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
