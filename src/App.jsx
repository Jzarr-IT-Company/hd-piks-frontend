import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { Suspense } from 'react';
import Routing from './Routing/Routing';
import AppLoader from './Components/AppLoader/AppLoader';

function App() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Routing />
    </Suspense>
  );
}

export default App;
