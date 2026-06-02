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

function storePlatformShortLabel(platform: StorePlatform): string {
  return platform === 'ios' ? 'iOS' : 'Play';
}

function StoreBadge({
  platform,
  className,
  compact = false,
}: {
  platform: StorePlatform;
  className?: string;
  compact?: boolean;
}) {
  const label = compact ? storePlatformShortLabel(platform) : storePlatformLabel(platform);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-semibold uppercase tracking-wider shrink-0',
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
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
  const dual = slotCount >= 2;

  if (variant === 'compact') {
    if (dual) {
      return (
        <div
          className="w-full rounded-xl border border-border/50 bg-muted/30 p-3 space-y-3"
          aria-hidden
        >
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted/60" />
          <div className="h-px bg-border/40" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-muted/60" />
        </div>
      );
    }
    return (
      <div
        className="h-[52px] w-full animate-pulse rounded-xl bg-muted/60 border border-border/40"
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        'w-full gap-3',
        dual ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col',
      )}
      aria-hidden
    >
      {Array.from({ length: dual ? 2 : 1 }, (_, i) => (
        <div
          key={i}
          className="h-[72px] w-full animate-pulse rounded-2xl bg-muted/50 border border-border/50"
        />
      ))}
    </div>
  );
}

/** One store row inside the compact panel (home / related cards). */
function CompactRatingRow({ data }: { data: AppRating }) {
  const score = data.rating.toFixed(1);
  const label = storePlatformLabel(data.platform);
  const countLabel =
    data.ratingCount === 1
      ? '1 rating'
      : `${formatRatingCount(data.ratingCount)} ratings`;
  const ariaLabel = `${score} out of 5 stars, ${formatRatingCountFull(data.ratingCount)} ratings on ${label}`;

  return (
    <div className="flex items-start gap-2.5 min-w-0" aria-label={ariaLabel}>
      <StoreBadge platform={data.platform} compact className="mt-0.5" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <StarRating rating={data.rating} size="sm" className="shrink-0" />
          <span className="text-sm font-semibold tabular-nums text-foreground leading-none">
            {score}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground tabular-nums leading-snug">{countLabel}</p>
      </div>
    </div>
  );
}

/** Single-store compact block (one bordered card). */
function CompactRatingSingle({ data }: { data: AppRating }) {
  return (
    <div
      className={cn(
        'w-full rounded-xl border border-border/70',
        'bg-background/75 px-3 py-2.5 shadow-sm backdrop-blur-sm',
      )}
    >
      <CompactRatingRow data={data} />
    </div>
  );
}

/** Dual-store compact: one panel, stacked rows — fits narrow portfolio columns. */
function CompactRatingPanel({ ratings }: { ratings: AppRating[] }) {
  return (
    <div
      className={cn(
        'w-full rounded-xl border border-border/70',
        'bg-background/75 px-3 py-3 shadow-sm backdrop-blur-sm',
        'space-y-3',
      )}
    >
      {ratings.map((data, index) => (
        <div key={`${data.platform}-${data.storeUrl}`}>
          {index > 0 ? <div className="mb-3 border-t border-border/60" aria-hidden /> : null}
          <CompactRatingRow data={data} />
        </div>
      ))}
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

function CompactRatings({ ratings }: { ratings: AppRating[] }) {
  if (ratings.length === 1) {
    return <CompactRatingSingle data={ratings[0]} />;
  }
  return <CompactRatingPanel ratings={ratings} />;
}

function DetailRatings({ ratings }: { ratings: AppRating[] }) {
  if (ratings.length < 2) {
    return (
      <div className="flex flex-col gap-3 w-full">
        {ratings.map((data) => (
          <DetailRatingCard key={`${data.platform}-${data.storeUrl}`} data={data} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {ratings.map((data) => (
        <DetailRatingCard key={`${data.platform}-${data.storeUrl}`} data={data} />
      ))}
    </div>
  );
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
    <div className={cn('w-full min-w-0', className)} aria-live="polite">
      {variant === 'compact' ? (
        <CompactRatings ratings={ratings} />
      ) : (
        <DetailRatings ratings={ratings} />
      )}
    </div>
  );
}
