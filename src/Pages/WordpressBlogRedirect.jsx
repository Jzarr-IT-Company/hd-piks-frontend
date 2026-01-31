import React, { useEffect , useRef } from 'react';

export default function WordpressBlogRedirect() {
    const openedRef = useRef(false);
  useEffect(() => {
    if (!openedRef.current) {
        window.open('https://hdpiks.com/blog', '_blank');
        openedRef.current = true;
    }
  }, []);

  return (
   null

  );
}