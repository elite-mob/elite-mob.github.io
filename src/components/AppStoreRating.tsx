import { Star } from 'lucide-react';
import { useAppRating } from '@/hooks/use-app-rating';
import {
  formatRatingCount,
  formatRatingCountFull,
  hasDisplayableRating,
  sortRatingsByPlatform,
  storePlatformLabel,
  type AppRating,
  type StorePlatform,
} from '@/lib/appStoreRating';
import { cn } from '@/lib/utils';

type AppStoreRatingProps = {
  storeLinks: string[];
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
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0',
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

function RatingSkeleton({
  variant,
  slotCount,
}: {
  variant: 'compact' | 'detail';
  slotCount: number;
}) {
  const slots = Math.min(Math.max(slotCount, 1), 2);

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'w-full gap-2',
          slots === 2 ? 'grid grid-cols-1 min-[420px]:grid-cols-2' : 'flex',
        )}
        aria-hidden
      >
        {Array.from({ length: slots }, (_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded-xl bg-muted/60 border border-border/40"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full gap-3',
        slots === 2 ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col',
      )}
      aria-hidden
    >
      {Array.from({ length: slots }, (_, i) => (
        <div
          key={i}
          className="h-[72px] w-full animate-pulse rounded-2xl bg-muted/50 border border-border/50"
        />
      ))}
    </div>
  );
}

function CompactRatingRow({ data }: { data: AppRating }) {
  const score = data.rating.toFixed(1);
  const label = storePlatformLabel(data.platform);
  const ariaLabel = `${score} out of 5 stars, ${formatRatingCountFull(data.ratingCount)} ratings on ${label}`;

  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center gap-2 rounded-xl border border-border/70',
        'bg-background/75 px-2.5 py-2 shadow-sm backdrop-blur-sm',
        'sm:gap-2.5 sm:px-3 sm:py-2',
      )}
      aria-label={ariaLabel}
    >
      <StoreBadge platform={data.platform} />
      <StarRating rating={data.rating} size="sm" className="shrink-0" />
      <span className="text-sm font-semibold tabular-nums text-foreground leading-none shrink-0">
        {score}
      </span>
      <span className="min-w-0 flex-1 text-right text-[11px] sm:text-xs text-muted-foreground tabular-nums leading-tight truncate">
        {formatRatingCount(data.ratingCount)} {data.ratingCount === 1 ? 'rating' : 'ratings'}
      </span>
    </div>
  );
}

function DetailRatingCard({ data }: { data: AppRating }) {
  const score = data.rating.toFixed(1);
  const label = storePlatformLabel(data.platform);
  const ariaLabel = `${score} out of 5 stars, ${formatRatingCountFull(data.ratingCount)} ratings on ${label}`;

  return (
    <div
      className={cn(
        'h-full w-full rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5',
        'shadow-sm backdrop-blur-sm',
      )}
      aria-label={ariaLabel}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <StoreBadge platform={data.platform} />
          <span className="text-[11px] text-muted-foreground truncate">Live from {label}</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2.5">
            <span className="font-display text-3xl font-bold tabular-nums text-foreground leading-none">
              {score}
            </span>
            <div className="pb-0.5">
              <StarRating rating={data.rating} size="lg" />
              <p className="mt-1 text-[11px] text-muted-foreground">out of 5</p>
            </div>
          </div>
          <div className="text-right">
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

function ratingsLayoutClass(variant: 'compact' | 'detail', count: number): string {
  if (count < 2) {
    return variant === 'compact' ? 'flex flex-col gap-2 w-full' : 'flex flex-col gap-3 w-full';
  }
  return variant === 'compact'
    ? 'grid w-full grid-cols-1 min-[420px]:grid-cols-2 gap-2'
    : 'grid w-full grid-cols-1 sm:grid-cols-2 gap-3';
}

export function AppStoreRating({
  storeLinks,
  className,
  variant = 'detail',
  enabled = true,
}: AppStoreRatingProps) {
  const links = storeLinks.filter(Boolean);
  const ratingState = useAppRating(links.length > 0 ? links : undefined, enabled);

  if (links.length === 0) return null;

  if (ratingState.status === 'loading') {
    return (
      <div className={className} aria-live="polite" aria-busy="true">
        <RatingSkeleton variant={variant} slotCount={links.length} />
      </div>
    );
  }

  if (ratingState.status !== 'success') return null;

  const ratings = sortRatingsByPlatform(
    ratingState.data.filter((d) => hasDisplayableRating(d.rating, d.ratingCount)),
  );
  if (ratings.length === 0) return null;

  return (
    <div
      className={cn(ratingsLayoutClass(variant, ratings.length), className)}
      aria-live="polite"
    >
      {ratings.map((data) =>
        variant === 'compact' ? (
          <CompactRatingRow key={`${data.platform}-${data.storeUrl}`} data={data} />
        ) : (
          <DetailRatingCard key={`${data.platform}-${data.storeUrl}`} data={data} />
        ),
      )}
    </div>
  );
}
