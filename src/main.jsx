import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import './index.css'
import { GlobalStates } from './Context/Context.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';
import { UIProvider } from './Context/UIContext.jsx';
import { UploadProvider } from './Context/UploadContext.jsx';
import { ProfileProvider } from './Context/ProfileContext.jsx';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query/queryClient.js';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <UIProvider>
            <UploadProvider>
              <ProfileProvider>
                <GlobalStates>
                  <App />
                </GlobalStates>
              </ProfileProvider>
            </UploadProvider>
          </UIProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>,
)
