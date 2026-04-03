import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import {
  subscribeToVisitStats,
  hasFirebaseConfig,
  type SiteVisitSummary,
} from '@/integrations/firebase/visitStatsFirestore';

export const VisitStats = () => {
  const [stats, setStats] = useState<SiteVisitSummary | null>(null);
  const enabled = hasFirebaseConfig();

  useEffect(() => {
    if (!enabled) return;
    return subscribeToVisitStats(setStats);
  }, [enabled]);

  if (!enabled || !stats || typeof stats.total_visits !== 'number') return null;

  const total = stats.total_visits ?? 0;
  const countries = stats.country_count ?? 0;
  const list = (stats.by_country ?? []).slice(0, 8);

  return (
    <div className="flex flex-col items-center gap-1 text-foreground/60 text-xs">
      <span className="inline-flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" aria-hidden />
        {total.toLocaleString()} visit{total !== 1 ? 's' : ''}
        {countries > 0 && (
          <span className="text-foreground/50">
            from {countries} countr{countries === 1 ? 'y' : 'ies'}
          </span>
        )}
      </span>
      {list.length > 0 && (
        <span className="text-foreground/45">
          {list.map((c) => c.name).join(', ')}
          {list.length < (stats.by_country?.length ?? 0) ? '…' : ''}
        </span>
      )}
    </div>
  );
};
