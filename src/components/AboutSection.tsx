import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { aboutContent } from '@/data/siteContent';
import { SectionBackdrop } from '@/components/SectionBackdrop';
import { SectionHeader } from '@/components/SectionHeader';
import { cn } from '@/lib/utils';

const highlightIcons = [Layers, Sparkles, ShieldCheck] as const;

export const AboutSection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-20 md:py-28 relative overflow-hidden min-h-[50vh] scroll-mt-24"
      ref={sectionRef}
    >
      <SectionBackdrop variant="calm" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className={cn('max-w-4xl mx-auto', isSectionVisible ? 'animate-fade-in-up' : 'opacity-0')}>
          <SectionHeader
            id="about-heading"
            title={
              <>
                About <span className="gradient-text-transparent">me</span>
              </>
            }
            description={aboutContent.intro}
            visible={isSectionVisible}
          />

          <div
            className={`grid sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 ${
              isSectionVisible ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0'
            }`}
          >
            {aboutContent.highlights.map((item, i) => {
              const Icon = highlightIcons[i] ?? Layers;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/70 glass-card shadow-sm p-5 sm:p-6 transition-shadow duration-300 hover:shadow-md"
                >
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/18 w-fit mb-3">
                    <Icon className="w-5 h-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-base sm:text-lg mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-foreground/82 leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>

          <div
            className={`mb-12 sm:mb-14 ${isSectionVisible ? 'animate-fade-in-up stagger-delay-3' : 'opacity-0'}`}
          >
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground text-center mb-6">
              How I work
            </h3>
            <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
              {aboutContent.principles.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-border/70 glass-card shadow-sm p-5 sm:p-6"
                >
                  <h4 className="font-display font-semibold text-foreground text-sm sm:text-base mb-2">{p.title}</h4>
                  <p className="text-xs sm:text-sm text-foreground/82 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
