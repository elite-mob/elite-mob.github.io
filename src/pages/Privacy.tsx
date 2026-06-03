import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { absoluteUrl, pageTitle } from '@/lib/site';
import { RouterNavButton } from '@/components/RouterNavButton';

const Privacy = () => {
  const lastUpdated = 'May 2026';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Seo
        title={pageTitle('Privacy Policy')}
        description="How this portfolio site handles contact form data and visitor privacy."
        canonicalPath="/privacy"
      />

      <Navigation />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-16 outline-none"
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <article className="glass-card rounded-2xl sm:rounded-3xl border border-primary/15 shadow-4d p-6 sm:p-10 md:p-12 space-y-8">
            <header className="space-y-2">
              <p className="text-xs text-foreground/55 uppercase tracking-wide">Legal</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground/90">Privacy Policy</h1>
              <p className="text-sm text-foreground/60">Last updated: {lastUpdated}</p>
            </header>

            <div className="prose prose-sm sm:prose-base max-w-none text-foreground/80 space-y-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:text-foreground/90 [&_h2]:mt-8 [&_h2]:mb-3">
              <p>
                This policy describes how information is handled when you use this portfolio website (
                <RouterNavButton
                  to="/"
                  className="inline text-primary underline underline-offset-2 hover:text-primary/90 p-0 font-inherit align-baseline"
                >
                  {absoluteUrl('/')}
                </RouterNavButton>
                ). It is provided in plain language for transparency and trust.
              </p>

              <h2>Who is responsible</h2>
              <p>
                This site is operated by Hans Chan as a portfolio site. For privacy-related questions about
                this site, use the contact options listed on the{' '}
                <RouterNavButton to="/#contact" className="inline text-primary underline underline-offset-2 p-0 font-inherit align-baseline">
                  Contact
                </RouterNavButton>{' '}
                section.
              </p>

              <h2>Contact form</h2>
              <p>
                When you submit the contact form, your name, email address, and message are transmitted to process your
                inquiry. Delivery may rely on a third-party email provider. Messages are used only to respond to you
                and are not sold or used for unrelated marketing.
              </p>

              <h2>Portfolio chat assistant</h2>
              <p>
                The site may offer a chat assistant that answers questions about this portfolio and helps you
                book a call. It is not a general-purpose AI chatbot: unrelated questions are answered with a short
                on-site message and are not sent to external AI services.
              </p>
              <p>
                When you ask about projects, skills, or experience, your message and relevant excerpts from public
                portfolio content may be sent to a secure server function, which calls OpenAI (model gpt-4.1-mini) to
                generate a reply grounded in that content only. Chat messages are not stored in a database on this site.
              </p>
              <p>
                When you book a call through the assistant, your name, email, and meeting topic may be used to prefill
                Calendly (or another scheduler you configure) and may be sent via the same email provider as the contact
                form so Hans can follow up. Scheduling is handled by that third-party tool under its own privacy policy.
              </p>

              <h2>Optional visit statistics</h2>
              <p>
                The site may display aggregate visit totals and broad geographic groupings (for example, by country). This
                is optional, does not build individual profiles, and is not used for marketing.
              </p>

              <h2>Cookies and local storage</h2>
              <p>
                The site may use browser storage (for example, to remember portfolio filter preferences) and cookies or
                similar technologies as needed for basic site functionality. You can clear site data in your browser
                settings at any time.
              </p>

              <h2>Third-party links</h2>
              <p>
                This site links to external projects (e.g. app stores), social profiles, and scheduling tools. Those
                services have their own privacy policies.
              </p>

              <h2>Your rights</h2>
              <p>
                Depending on where you live, you may have rights to access, correct, or delete personal data related to
                your messages. Contact me through the site and I will respond within a reasonable time.
              </p>

              <h2>Changes</h2>
              <p>
                This policy may be updated occasionally. The &quot;Last updated&quot; date at the top will change when
                material updates are made.
              </p>
            </div>

            <p className="pt-4 border-t border-border/50 text-sm">
              <RouterNavButton to="/" className="text-primary font-medium hover:underline p-0 text-left">
                ← Back to home
              </RouterNavButton>
            </p>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
