import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type RouterNavButtonProps = {
  to: string;
  replace?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

/**
 * In-app navigation without an `<a href>`, so the browser status bar does not show a URL on hover.
 * Use for styled links and cards; preserve aria-labels where needed.
 */
export function RouterNavButton({ to, replace, children, className, onClick, ...rest }: RouterNavButtonProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          navigate(to, { replace });
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
