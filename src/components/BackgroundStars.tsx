import { cn } from '@/lib/utils';

type Star = {
  left: number;
  top: number;
  size: 'sm' | 'md' | 'lg';
  delay: number;
  duration: number;
};

/** Fixed viewport positions — spread for coverage as users scroll sections. */
const STARS: Star[] = [
  { left: 5, top: 8, size: 'md', delay: 0, duration: 4.6 },
  { left: 14, top: 4, size: 'sm', delay: 1.4, duration: 5.8 },
  { left: 26, top: 12, size: 'lg', delay: 0.6, duration: 6.2 },
  { left: 38, top: 6, size: 'sm', delay: 2.1, duration: 5.1 },
  { left: 49, top: 15, size: 'md', delay: 0.9, duration: 4.9 },
  { left: 62, top: 5, size: 'sm', delay: 3.2, duration: 6.5 },
  { left: 74, top: 11, size: 'lg', delay: 1.8, duration: 5.4 },
  { left: 86, top: 7, size: 'md', delay: 2.6, duration: 5.9 },
  { left: 94, top: 18, size: 'sm', delay: 0.3, duration: 4.4 },
  { left: 8, top: 24, size: 'sm', delay: 1.1, duration: 6.8 },
  { left: 22, top: 31, size: 'md', delay: 2.9, duration: 5.2 },
  { left: 35, top: 27, size: 'sm', delay: 1.6, duration: 5.6 },
  { left: 55, top: 33, size: 'lg', delay: 3.5, duration: 6.1 },
  { left: 68, top: 28, size: 'md', delay: 0.5, duration: 4.8 },
  { left: 81, top: 36, size: 'sm', delay: 2.3, duration: 6.4 },
  { left: 92, top: 42, size: 'md', delay: 1.9, duration: 5.7 },
  { left: 11, top: 48, size: 'lg', delay: 3.8, duration: 5.3 },
  { left: 29, top: 52, size: 'sm', delay: 0.8, duration: 4.7 },
  { left: 44, top: 46, size: 'md', delay: 2.4, duration: 5.5 },
  { left: 58, top: 54, size: 'sm', delay: 1.3, duration: 6.0 },
  { left: 72, top: 49, size: 'md', delay: 3.1, duration: 5.0 },
  { left: 6, top: 66, size: 'sm', delay: 0.4, duration: 4.5 },
  { left: 19, top: 72, size: 'md', delay: 2.7, duration: 5.8 },
  { left: 33, top: 68, size: 'lg', delay: 1.5, duration: 6.3 },
  { left: 47, top: 76, size: 'sm', delay: 3.6, duration: 5.4 },
  { left: 61, top: 71, size: 'md', delay: 0.7, duration: 4.9 },
  { left: 77, top: 78, size: 'sm', delay: 2.0, duration: 5.6 },
  { left: 88, top: 65, size: 'md', delay: 1.0, duration: 6.1 },
  { left: 95, top: 82, size: 'sm', delay: 2.8, duration: 5.2 },
  { left: 16, top: 88, size: 'md', delay: 3.3, duration: 5.9 },
  { left: 40, top: 92, size: 'sm', delay: 0.2, duration: 4.3 },
  { left: 53, top: 86, size: 'lg', delay: 1.7, duration: 6.6 },
  { left: 70, top: 93, size: 'sm', delay: 2.5, duration: 5.1 },
];

/**
 * Fixed four-point stars above page content (main is z-10), below neural spotlight.
 */
export function BackgroundStars() {
  return (
    <div className="background-stars print:hidden" aria-hidden>
      {STARS.map((star, index) => (
        <span
          key={`bg-star-${index}`}
          className={cn('background-star', `background-star--${star.size}`)}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        >
          <span className="background-star__rays" />
          <span className="background-star__core" />
        </span>
      ))}
    </div>
  );
}
