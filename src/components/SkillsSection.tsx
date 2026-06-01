import { techStackGroups, proficiencyLegend, getProficiencyTier, type TechCategoryId } from '@/data/skillsData';
import { Code2, Server, Smartphone, Brain, Cloud } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryIcons: Record<TechCategoryId, LucideIcon> = {
  frontend: Code2,
  backend: Server,
  mobile: Smartphone,
  aiData: Brain,
  devops: Cloud,
};

type SkillProficiencyBarProps = {
  name: string;
  level: number;
  animate: boolean;
  delayMs?: number;
};

function SkillProficiencyBar({ name, level, animate, delayMs = 0 }: SkillProficiencyBarProps) {
  const tier = getProficiencyTier(level);

  return (
    <div className="group/skill">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-sm font-medium text-foreground/95 leading-tight">{name}</span>
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-primary/90 shrink-0">
          {tier}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name}: ${tier}, ${level} percent`}
        className="relative h-2.5 rounded-full bg-muted/80 border border-border/50 overflow-hidden"
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            'bg-gradient-to-r from-primary via-primary to-[hsl(200_75%_48%)]',
            'shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2)]',
            'transition-[width] duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          )}
          style={{
            width: animate ? `${level}%` : '0%',
            transitionDelay: animate ? `${delayMs}ms` : '0ms',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-40 bg-[linear-gradient(90deg,transparent_0%,hsl(0_0%_100%/0.35)_50%,transparent_100%)]"
          aria-hidden
        />
      </div>
    </div>
  );
}

export const SkillsSection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.08 });

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="py-20 md:py-28 relative overflow-hidden min-h-[50vh]"
      ref={sectionRef}
    >
      <div className="absolute inset-0 bg-section-calm" aria-hidden />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <header
          className={cn(
            'text-center mb-8 sm:mb-10 md:mb-12',
            isSectionVisible ? 'animate-fade-in-up' : 'opacity-0',
          )}
        >
          <h2
            id="skills-heading"
            className={cn(
              'font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-4',
              isSectionVisible ? 'animate-text-reveal stagger-delay-1' : 'opacity-0',
            )}
          >
            Tech stack <span className="gradient-text-transparent">by proficiency</span>
          </h2>
          <p
            className={cn(
              'text-sm sm:text-base md:text-lg text-foreground/90 max-w-3xl mx-auto leading-relaxed px-4 mb-6',
              isSectionVisible ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0',
            )}
          >
            Depth across the stacks I use in production — from UI through APIs, mobile, AI, and shipping.
          </p>

          <div
            className={cn(
              'flex flex-wrap justify-center gap-x-4 gap-y-2 px-4',
              isSectionVisible ? 'animate-fade-in-up stagger-delay-3' : 'opacity-0',
            )}
            aria-label="Proficiency scale"
          >
            {proficiencyLegend.map(({ tier, range }) => (
              <span
                key={tier}
                className="inline-flex items-center gap-2 text-xs text-foreground/75"
              >
                <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-primary to-[hsl(200_75%_48%)]" aria-hidden />
                <span>
                  <span className="font-semibold text-foreground/90">{tier}</span>
                  <span className="text-foreground/60"> · {range}</span>
                </span>
              </span>
            ))}
          </div>
        </header>

        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6',
            isSectionVisible ? 'animate-fade-in-up' : 'opacity-0',
          )}
        >
          {techStackGroups.map(({ id, label, items }, index) => {
            const Icon = categoryIcons[id];
            const delayClass =
              index === 0
                ? 'stagger-delay-1'
                : index === 1
                  ? 'stagger-delay-2'
                  : index === 2
                    ? 'stagger-delay-3'
                    : index === 3
                      ? 'stagger-delay-4'
                      : 'stagger-delay-5';
            return (
              <div
                key={id}
                className={cn(
                  'group rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-border/70 glass-card shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-300 relative overflow-hidden',
                  isSectionVisible ? `animate-fade-in-up ${delayClass}` : 'opacity-0',
                )}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/60">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-foreground/95">{label}</h3>
                      <p className="text-xs text-foreground/65 mt-0.5">{items.length} core tools</p>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-4 list-none m-0 p-0">
                    {items.map((skill, skillIndex) => (
                      <li key={skill.name}>
                        <SkillProficiencyBar
                          name={skill.name}
                          level={skill.level}
                          animate={isSectionVisible}
                          delayMs={skillIndex * 40}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
