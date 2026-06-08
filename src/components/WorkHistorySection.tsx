import { useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { workHistoryContent } from '@/data/siteContent';
import { workExperiences, type WorkExperience } from '@/data/workHistoryData';
import { SectionBackdrop } from '@/components/SectionBackdrop';
import { SectionHeader } from '@/components/SectionHeader';
import { cn } from '@/lib/utils';

const MONTH_INDEX: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

function parseMonthYear(part: string): { month: number; year: number } | null {
  const [monthRaw, yearRaw] = part.trim().split(/\s+/);
  const month = MONTH_INDEX[monthRaw?.toUpperCase() ?? ''];
  const year = Number.parseInt(yearRaw ?? '', 10);
  if (!month || !Number.isFinite(year)) return null;
  return { month, year };
}

function periodStartSortKey(period: string): number {
  const start = period.split(' - ')[0]?.trim() ?? '';
  const parsed = parseMonthYear(start);
  if (!parsed) return 0;
  return parsed.year * 12 + parsed.month;
}

function formatTimelinePeriod(period: string): string {
  return period
    .split(' - ')
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed.toUpperCase() === 'PRESENT') return 'Current';
      const parsed = parseMonthYear(trimmed);
      if (!parsed) return trimmed;
      return `${String(parsed.month).padStart(2, '0')}.${parsed.year}`;
    })
    .join(' - ');
}

function displayCompany(company: string): string {
  return company.replace(/\s*\/\s*Contract$/i, '').trim();
}

function TimelineCard({
  experience,
  index,
  visible,
  side,
}: {
  experience: WorkExperience;
  index: number;
  visible: boolean;
  side: 'left' | 'right';
}) {
  const periodLabel = formatTimelinePeriod(experience.period);

  return (
    <article
      className={cn(
        'group relative w-full max-w-[19rem] sm:max-w-[21rem] rounded-xl border border-border/55',
        'bg-card/75 backdrop-blur-md shadow-sm transition-all duration-300',
        'hover:border-primary/35 hover:bg-card/90 hover:shadow-md hover:shadow-primary/[0.06]',
        visible ? 'animate-fade-in-up' : 'opacity-0',
        side === 'left' ? 'md:ml-auto' : 'md:mr-auto',
      )}
      style={{ animationDelay: visible ? `${Math.min(index, 12) * 40}ms` : undefined }}
    >
      <div className="flex items-start gap-3.5 p-4 sm:p-5">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg',
            'border border-border/50 bg-secondary/70',
          )}
          aria-hidden
        >
          <Briefcase className="size-5 text-primary" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-display text-[0.95rem] sm:text-base font-semibold leading-snug text-foreground [text-wrap:balance]">
            {experience.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-snug">{displayCompany(experience.company)}</p>
          <time
            dateTime={periodLabel.replace(' - ', '/')}
            className="block pt-1 text-xs tabular-nums text-muted-foreground/75"
          >
            {periodLabel}
          </time>
        </div>
      </div>
    </article>
  );
}

export const WorkHistorySection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.06 });

  const timelineEntries = useMemo(
    () => [...workExperiences].sort((a, b) => periodStartSortKey(b.period) - periodStartSortKey(a.period)),
    [],
  );

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="py-20 md:py-28 relative overflow-hidden scroll-mt-24"
      ref={sectionRef}
    >
      <SectionBackdrop variant="elevated" grid />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          id="experience-heading"
          eyebrow={workHistoryContent.eyebrow}
          title={
            <>
              Work <span className="gradient-text-transparent">history</span>
            </>
          }
          description={workHistoryContent.supporting}
          visible={isSectionVisible}
        />

        <div
          className={cn(
            'relative mx-auto max-w-4xl',
            !isSectionVisible && 'opacity-0',
          )}
        >
          <div
            className="pointer-events-none absolute left-4 top-0 bottom-0 w-px bg-border/70 md:left-1/2 md:-translate-x-1/2"
            aria-hidden
          />

          <ol className="relative list-none m-0 space-y-8 sm:space-y-10 p-0" aria-label="Work experience timeline">
            {timelineEntries.map((experience, index) => {
              const side: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right';

              return (
                <li
                  key={experience.id}
                  className={cn(
                    'relative pl-12 md:pl-0',
                    side === 'left'
                      ? 'md:grid md:grid-cols-2 md:gap-10'
                      : 'md:grid md:grid-cols-2 md:gap-10',
                  )}
                >
                  <div
                    className={cn(
                      'absolute left-4 top-6 z-10 size-3 -translate-x-1/2 rounded-full border-2 border-primary/50 bg-background md:left-1/2',
                      'group-hover:border-primary transition-colors',
                    )}
                    aria-hidden
                  />

                  {side === 'left' ? (
                    <>
                      <div className="md:col-start-1 md:row-start-1 flex md:justify-end md:pr-2">
                        <TimelineCard
                          experience={experience}
                          index={index}
                          visible={isSectionVisible}
                          side={side}
                        />
                      </div>
                      <div className="hidden md:block md:col-start-2" aria-hidden />
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block md:col-start-1" aria-hidden />
                      <div className="md:col-start-2 md:row-start-1 flex md:justify-start md:pl-2">
                        <TimelineCard
                          experience={experience}
                          index={index}
                          visible={isSectionVisible}
                          side={side}
                        />
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
