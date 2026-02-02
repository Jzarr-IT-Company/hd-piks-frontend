import React, { useEffect , useRef } from 'react';

export default function WordpressBlogRedirect() {
    const openedRef = useRef(false);
  useEffect(() => {
     if (!openedRef.current) {
        
         window.location.replace('https://hdpiks.com/blog/');
     }
        // openedRef.current = true;
  }, []);

  return (
   null

  );
}