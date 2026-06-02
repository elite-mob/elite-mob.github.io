import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  visible?: boolean;
  className?: string;
};

export function SectionHeader({
  id,
  eyebrow,
  title,
  description,
  visible = true,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        'text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14',
        visible ? 'animate-fade-in-up' : 'opacity-0',
        className,
      )}
    >
      {eyebrow && (
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-primary/90 mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 [text-wrap:balance]"
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-foreground/75 leading-relaxed [text-wrap:balance] px-2">
          {description}
        </p>
      )}
    </header>
  );
}
