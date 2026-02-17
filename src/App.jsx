import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Ensure Bootstrap JS is imported
import React, { Suspense } from 'react';
import Routing from './Routing/Routing';

function App() {
  return (
    <Suspense fallback={<div style={{textAlign:'center',marginTop:'20vh',fontSize:24}}>Loading...</div>}>
      <Routing />
    </Suspense>
  );
}

export default App;
