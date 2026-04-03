import { techStackGroups, type TechCategoryId } from '@/data/skillsData';
import { Code2, Server, Smartphone, Brain, Cloud } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: Record<TechCategoryId, LucideIcon> = {
  frontend: Code2,
  backend: Server,
  mobile: Smartphone,
  aiData: Brain,
  devops: Cloud,
};

export const SkillsSection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1 });

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
          className={`text-center mb-10 sm:mb-12 md:mb-16 ${
            isSectionVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <h2
            id="skills-heading"
            className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 md:mb-6 px-4 ${
              isSectionVisible ? 'animate-text-reveal stagger-delay-1' : 'opacity-0'
            }`}
          >
            Tech stack <span className="gradient-text-transparent">by domain</span>
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg text-foreground/90 max-w-3xl mx-auto leading-relaxed px-4 mb-2 ${
              isSectionVisible ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0'
            }`}
          >
            Tools grouped by how I design, build, ship, and run production systems.
          </p>
        </header>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 ${
            isSectionVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
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
                className={`group rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-border/70 bg-card shadow-sm hover:shadow-md hover:border-border transition-all duration-300 relative overflow-hidden ${
                  isSectionVisible ? `animate-fade-in-up ${delayClass}` : 'opacity-0'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground/95">{label}</h3>
                  </div>
                  <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                    {items.map((skill) => (
                      <li key={skill}>
                        <span className="inline-block px-2.5 sm:px-3 py-1.5 rounded-lg bg-secondary/85 text-foreground/90 text-xs font-medium border border-primary/12">
                          {skill}
                        </span>
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
