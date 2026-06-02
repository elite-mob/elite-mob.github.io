import { Star } from 'lucide-react';
import { useAppRating } from '@/hooks/use-app-rating';
import {
  formatRatingCount,
  formatRatingCountFull,
  canFetchStoreRating,
  hasDisplayableRating,
  storePlatformLabel,
  type StorePlatform,
} from '@/lib/appStoreRating';
import { cn } from '@/lib/utils';

type AppStoreRatingProps = {
  storeLink: string | undefined;
  className?: string;
  /** `compact` for portfolio cards; `detail` for case study hero */
  variant?: 'compact' | 'detail';
  /** Defer fetch until true (e.g. card in viewport) */
  enabled?: boolean;
};

function StarRating({
  rating,
  size = 'md',
  className,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const starSize =
    size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-[18px] w-[18px]' : 'h-3.5 w-3.5';
  const clamped = Math.min(5, Math.max(0, rating));
  const full = Math.floor(clamped);
  const partial = clamped - full;

  return (
    <div className={cn('flex items-center gap-px', className)} aria-hidden>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = i < full ? 1 : i === full && partial >= 0.25 ? partial : 0;
        return (
          <span key={i} className={cn('relative inline-flex shrink-0', starSize)}>
            <Star
              className={cn(starSize, 'text-foreground/15 dark:text-foreground/20')}
              strokeWidth={0}
              fill="currentColor"
            />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${Math.min(1, fill) * 100}%` }}
              >
                <Star
                  className={cn(starSize, 'text-amber-500 dark:text-amber-400')}
                  strokeWidth={0}
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function StoreBadge({ platform, className }: { platform: StorePlatform; className?: string }) {
  const label = storePlatformLabel(platform);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        platform === 'ios'
          ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/20'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20',
        className,
      )}
    >
      {label}
    </span>
  );
}

function RatingSkeleton({ variant }: { variant: 'compact' | 'detail' }) {
  if (variant === 'compact') {
    return (
      <div
        className="inline-flex h-7 w-36 animate-pulse rounded-full bg-muted/60"
        aria-hidden
      />
    );
  }
  return (
    <div
      className="h-[72px] w-full animate-pulse rounded-2xl bg-muted/50 border border-border/50"
      aria-hidden
    />
  );
}

export function AppStoreRating({
  storeLink,
  className,
  variant = 'detail',
  enabled = true,
}: AppStoreRatingProps) {
  const canFetch = canFetchStoreRating(storeLink);
  const ratingState = useAppRating(canFetch ? storeLink : undefined, enabled && canFetch);

  if (!canFetch) return null;

  if (ratingState.status === 'loading') {
    return (
      <div className={className} aria-live="polite" aria-busy="true">
        <RatingSkeleton variant={variant} />
      </div>
    );
  }

  if (ratingState.status !== 'success') return null;

  const { data } = ratingState;
  if (!hasDisplayableRating(data.rating, data.ratingCount)) return null;

  const score = data.rating.toFixed(1);
  const label = storePlatformLabel(data.platform);
  const ariaLabel = `${score} out of 5 stars, ${formatRatingCountFull(data.ratingCount)} ratings on ${label}`;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex max-w-full items-center gap-2.5 rounded-full border border-border/70',
          'bg-background/70 px-3 py-1.5 shadow-sm backdrop-blur-sm',
          className,
        )}
        aria-label={ariaLabel}
      >
        <StarRating rating={data.rating} size="sm" />
        <span className="text-sm font-semibold tabular-nums text-foreground leading-none">
          {score}
        </span>
        <span className="h-3 w-px bg-border/80 shrink-0" aria-hidden />
        <span className="text-xs text-muted-foreground tabular-nums leading-none">
          {formatRatingCount(data.ratingCount)}
        </span>
        <StoreBadge platform={data.platform} className="hidden sm:inline-flex shrink-0" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5',
        'shadow-sm backdrop-blur-sm',
        className,
      )}
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              data.platform === 'ios'
                ? 'bg-gradient-to-br from-sky-500/15 to-sky-600/5 ring-1 ring-sky-500/20'
                : 'bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 ring-1 ring-emerald-500/20',
            )}
            aria-hidden
          >
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" strokeWidth={0} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Store rating
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <StoreBadge platform={data.platform} />
              <span className="text-xs text-muted-foreground truncate">Live from {label}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-2 sm:justify-end">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-3xl font-bold tabular-nums text-foreground leading-none">
              {score}
            </span>
            <div className="pb-0.5">
              <StarRating rating={data.rating} size="lg" />
              <p className="mt-1 text-[11px] text-muted-foreground">out of 5</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="font-display text-lg font-semibold tabular-nums text-foreground leading-none">
              {formatRatingCountFull(data.ratingCount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data.ratingCount === 1 ? 'rating' : 'ratings'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
