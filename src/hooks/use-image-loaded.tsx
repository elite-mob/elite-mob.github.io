import { useState, useEffect, RefObject } from 'react';

export const useImageLoaded = (imageSrc: string): boolean => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!imageSrc) {
      setIsLoaded(true);
      return;
    }

    const img = new Image();
    img.src = imageSrc;
    
    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      // Even if image fails to load, proceed with animations
      setIsLoaded(true);
    };

    if (img.complete) {
      setIsLoaded(true);
    } else {
      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [imageSrc]);

  return isLoaded;
};
