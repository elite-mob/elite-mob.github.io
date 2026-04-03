import { useEffect, useRef, useState } from 'react';

interface Use3DTiltOptions {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  reverse?: boolean;
}

export const use3DTilt = (options: Use3DTiltOptions = {}) => {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.05,
    reverse = false,
  } = options;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = reverse
        ? ((y - centerY) / centerY) * maxTilt
        : -((y - centerY) / centerY) * maxTilt;
      const rotateY = reverse
        ? -((x - centerX) / centerX) * maxTilt
        : ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `
        perspective(${perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(${scale}, ${scale}, ${scale})
        translateZ(20px)
      `;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      if (card) {
        card.style.transition = 'transform 0.1s ease-out';
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (card) {
        card.style.transition = 'transform 0.5s ease-out';
        card.style.transform = `
          perspective(${perspective}px)
          rotateX(0deg)
          rotateY(0deg)
          scale3d(1, 1, 1)
          translateZ(0px)
        `;
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered, maxTilt, perspective, scale, reverse]);

  return cardRef;
};
