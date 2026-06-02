import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { workHistoryContent } from '@/data/siteContent';
import { workExperiences, type WorkExperience } from '@/data/workHistoryData';
import { SectionBackdrop } from '@/components/SectionBackdrop';
import { SectionHeader } from '@/components/SectionHeader';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

function formatPeriod(period: string): string {
  return period
    .split(' - ')
    .map((part) => {
      const trimmed = part.trim();
      if (trimmed.toUpperCase() === 'PRESENT') return 'Present';
      const [month, year] = trimmed.split(/\s+/);
      if (!month || !year) return trimmed;
      const label = month.charAt(0) + month.slice(1).toLowerCase();
      return `${label} ${year}`;
    })
    .join(' - ');
}

function isCurrentRole(period: string): boolean {
  return period.toUpperCase().includes('PRESENT');
}

function ExperienceEntry({
  experience,
  index,
  visible,
  variant,
}: {
  experience: WorkExperience;
  index: number;
  visible: boolean;
  variant: 'featured' | 'timeline';
}) {
  const [open, setOpen] = useState(variant === 'featured');
  const current = isCurrentRole(experience.period);
  const hasDetails = experience.achievements.length > 0;
  const periodLabel = formatPeriod(experience.period);

  return (
    <li
      className={cn(
        variant === 'timeline' && 'relative pl-0 sm:pl-2',
        visible ? 'animate-fade-in-up' : 'opacity-0',
      )}
      style={{ animationDelay: visible ? `${Math.min(index, 12) * 35}ms` : undefined }}
    >
      {variant === 'timeline' && (
        <div
          className="absolute left-[7px] sm:left-[9px] top-6 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent"
          aria-hidden
        />
      )}

      <article
        className={cn(
          'group relative rounded-2xl border transition-all duration-300',
          'bg-card/60 backdrop-blur-md',
          variant === 'featured'
            ? 'p-5 sm:p-6 border-primary/30 shadow-lg shadow-primary/[0.07] hover:border-primary/45 hover:shadow-xl hover:shadow-primary/[0.1] hover:-translate-y-0.5'
            : cn(
                'ml-6 sm:ml-8 p-4 sm:p-5 border-border/60',
                'hover:border-primary/30 hover:bg-card/80 hover:shadow-md',
                current && 'border-primary/25',
              ),
        )}
      >
        {variant === 'timeline' && (
          <div
            className={cn(
              'absolute -left-[1.35rem] sm:-left-[1.6rem] top-5 size-3.5 sm:size-4 rounded-full border-2 bg-background',
              current
                ? 'border-primary bg-primary shadow-[0_0_0_5px_hsl(var(--primary)/0.12)]'
                : 'border-primary/40 group-hover:border-primary/70',
            )}
            aria-hidden
          />
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {current && (
                <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                  Now
                </span>
              )}
              <time
                dateTime={periodLabel.replace(' - ', '/')}
                className="font-mono text-[11px] sm:text-xs font-medium tabular-nums text-muted-foreground"
              >
                {periodLabel}
              </time>
            </div>
            <h3
              className={cn(
                'font-display font-bold text-foreground leading-snug [text-wrap:balance]',
                variant === 'featured' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg',
              )}
            >
              {experience.title}
            </h3>
            <p className="text-sm font-medium text-primary/90">{experience.company}</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-foreground/80 [text-wrap:pretty]">
          {experience.summary}
        </p>

        {hasDetails && (
          <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
            <CollapsibleTrigger
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 -mx-1',
                'text-xs sm:text-sm font-semibold text-foreground/85',
                'bg-muted/50 hover:bg-muted/80 border border-border/50',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <span>{open ? 'Less detail' : 'Key highlights'}</span>
              <ChevronDown
                className={cn('size-4 shrink-0 text-primary transition-transform duration-200', open && 'rotate-180')}
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden">
              <ul className="mt-3 space-y-2 rounded-xl bg-muted/30 border border-border/40 p-3 sm:p-4">
                {experience.achievements.map((item, bulletIndex) => (
                  <li
                    key={`${experience.id}-${bulletIndex}`}
                    className="flex gap-2.5 text-sm leading-relaxed text-foreground/78"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </article>
    </li>
  );
}

export const WorkHistorySection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.06 });

  const { currentRoles, pastRoles } = useMemo(() => {
    const current = workExperiences.filter((e) => isCurrentRole(e.period));
    const past = workExperiences.filter((e) => !isCurrentRole(e.period));
    return { currentRoles: current, pastRoles: past };
  }, []);

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

        <div className={cn('max-w-5xl mx-auto space-y-14 sm:space-y-16', !isSectionVisible && 'opacity-0')}>
          {currentRoles.length > 0 && (
            <div>
              <h3 className="sr-only">Current roles</h3>
              <ul
                className={cn(
                  'grid gap-4 sm:gap-5 list-none m-0 p-0',
                  currentRoles.length > 1 ? 'md:grid-cols-2' : 'max-w-xl mx-auto',
                )}
              >
                {currentRoles.map((experience, index) => (
                  <ExperienceEntry
                    key={experience.id}
                    experience={experience}
                    index={index}
                    visible={isSectionVisible}
                    variant="featured"
                  />
                ))}
              </ul>
            </div>
          )}

          {pastRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-8 sm:mb-10">
                <h3 className="font-display text-sm sm:text-base font-semibold uppercase tracking-widest text-foreground/70 shrink-0">
                  Earlier roles
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" aria-hidden />
              </div>
              <ol className="list-none m-0 p-0 space-y-5 sm:space-y-6" aria-label="Earlier work experience">
                {pastRoles.map((experience, index) => (
                  <ExperienceEntry
                    key={experience.id}
                    experience={experience}
                    index={index + currentRoles.length}
                    visible={isSectionVisible}
                    variant="timeline"
                  />
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
