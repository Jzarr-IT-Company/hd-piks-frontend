import React, { useEffect } from 'react';

function DesignHdpiks() {
  useEffect(() => {
    window.location.href = 'https://design.hdpiks.com/';
  }, []);

  return (
    <section className="container py-5">
      <h4 className="mb-3">Redirecting to Design Studio...</h4>
      <p className="mb-3">
        If you are not redirected automatically, click below:
      </p>
      <a
        href="https://design.hdpiks.com/"
        className="btn btn-dark"
      >
        Open Design Studio
      </a>
    </section>
  );
}

export default DesignHdpiks;
