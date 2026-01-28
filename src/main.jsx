import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import './index.css'
import { GlobalStates } from './Context/Context.jsx';
import { HelmetProvider } from 'react-helmet-async';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GlobalStates>
        <App />
      </GlobalStates>
    </HelmetProvider>
  </StrictMode>,
)
