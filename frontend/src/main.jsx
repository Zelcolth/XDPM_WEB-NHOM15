import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import { setAuthToken } from './api/axiosClient'

// Set axios Authorization header from localStorage before React mounts.
// This ensures requests immediately after refresh include the token.
const token = localStorage.getItem('token');
setAuthToken(token);

// Keep axios header in sync across multiple tabs/windows
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    setAuthToken(e.newValue);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
