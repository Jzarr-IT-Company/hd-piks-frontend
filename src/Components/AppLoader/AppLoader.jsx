import React from 'react';
import './AppLoader.css';

function AppLoader() {
  return (
    <div className="app-loader" role="status" aria-live="polite" aria-label="Loading application">
      <div className="app-loader__mark">
        <span className="app-loader__ring app-loader__ring--outer" />
        <span className="app-loader__ring app-loader__ring--inner" />
        <span className="app-loader__dot" />
      </div>
      <div className="app-loader__label">Elvify</div>
      {/* <div className="app-loader__subtext">Loading experience...</div> */}
    </div>
  );
}

export default AppLoader;
