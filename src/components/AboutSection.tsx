import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { Layers, Sparkles, ShieldCheck } from 'lucide-react';
import { aboutContent } from '@/data/siteContent';

const highlightIcons = [Layers, Sparkles, ShieldCheck] as const;

export const AboutSection = () => {
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-20 md:py-28 relative overflow-hidden min-h-[50vh]"
      ref={sectionRef}
    >
      <div className="absolute inset-0 z-0 bg-section-calm" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
        <div
          className="absolute left-1/2 top-[48%] h-[min(72vh,34rem)] w-[min(120vw,52rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[96px] sm:blur-[110px]"
          style={{
            background:
              'radial-gradient(circle at center, hsl(187 50% 52% / 0.05) 0%, hsl(187 50% 52% / 0.015) 48%, transparent 68%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className={`max-w-4xl mx-auto ${isSectionVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
          <header className="text-center mb-10 sm:mb-12 md:mb-14">
            <h2
              id="about-heading"
              className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground ${
                isSectionVisible ? 'animate-text-reveal stagger-delay-1' : 'opacity-0'
              }`}
            >
              About <span className="gradient-text-transparent">Me</span>
            </h2>
            <p
              className={`mt-5 text-sm sm:text-base md:text-[1.05rem] text-foreground/90 max-w-2xl mx-auto leading-relaxed [text-wrap:balance] ${
                isSectionVisible ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0'
              }`}
            >
              {aboutContent.intro}
            </p>
          </header>

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
