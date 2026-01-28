import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Ensure Bootstrap JS is imported
import React from 'react';
import Routing from './Routing/Routing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  // Query Client Configuration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        cacheTime: 0, // Clear cache immediately after browser close
        staleTime: Infinity, // Data remains fresh until manually invalidated
        refetchOnWindowFocus: false, // Do not refetch when the window regains focus
      },
    }, 
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Routing />
    </QueryClientProvider>
  );
}

export default App;
