import { techStackGroups, getProficiencyTier } from '@/data/skillsData';
import { Code2, Server, Smartphone, Brain, Cloud } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import type { LucideIcon } from 'lucide-react';
import { SectionBackdrop } from '@/components/SectionBackdrop';
import { SectionHeader } from '@/components/SectionHeader';
import { cn } from '@/lib/utils';
import type { TechCategoryId } from '@/data/skillsData';

const categoryIcons: Record<TechCategoryId, LucideIcon> = {
  frontend: Code2,
  backend: Server,
  mobile: Smartphone,
  aiData: Brain,
  devops: Cloud,
};

export const SkillsSection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.08 });

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="py-20 md:py-28 relative overflow-hidden scroll-mt-24"
      ref={sectionRef}
    >
      <SectionBackdrop variant="calm" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          id="skills-heading"
          eyebrow="CAPABILITIES"
          title={
            <>
              Tech stack <span className="gradient-text-transparent">by domain</span>
            </>
          }
          description="Production tools across frontend, backend, mobile, AI, and shipping, depth where it counts."
          visible={isSectionVisible}
        />

        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5',
            isSectionVisible ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0',
          )}
        >
          {techStackGroups.map(({ id, label, items }) => {
            const Icon = categoryIcons[id];
            return (
              <div
                key={id}
                className="rounded-2xl border border-border/60 glass-card p-5 sm:p-6 shadow-sm hover:border-primary/25 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{label}</h3>
                </div>
                <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                  {items.map((skill) => {
                    const tier = getProficiencyTier(skill.level);
                    return (
                      <li key={skill.name}>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-lg border border-border/60',
                            'bg-background/50 px-2.5 py-1.5 text-sm font-medium text-foreground/90',
                            'transition-colors hover:border-primary/35 hover:bg-primary/8',
                          )}
                          title={`${tier} proficiency`}
                        >
                          {skill.name}
                          <span className="text-[9px] font-bold uppercase tracking-wider text-primary/80">
                            {tier}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
