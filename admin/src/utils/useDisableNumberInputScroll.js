import { useEffect } from 'react';

const useDisableNumberInputScroll = () => {
  useEffect(() => {
    const handleWheel = (event) => {
      // Check if the event target is a number input
      if (event.target.type === 'number') {
        event.preventDefault();
      }
    };

    // Add the event listener to the document
    document.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []); // Empty dependency array ensures the effect runs only once
};

export default useDisableNumberInputScroll;


