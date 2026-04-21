import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RouterNavButton } from '@/components/RouterNavButton';
import { Send, Github, SquareStackIcon, Sparkles, MessageSquare, Lock, ShieldCheck, Clock } from 'lucide-react';
import { contactCtaContent } from '@/data/siteContent';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import emailjs from '@emailjs/browser';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { getContactEmailHint, getEmailJsConfig } from '@/lib/emailjsConfig';
import { z } from 'zod';

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  message: z.string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Rate limiting constants
const RATE_LIMIT_MS = 60000; // 1 minute between submissions

const socialLinks = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/elite-mob' },
  { icon: SquareStackIcon, label: 'StackOverflow', href: 'https://stackoverflow.com/users/8172804/lovemob' },
] as const;

const socialLinkClassName =
  'group relative inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] px-2 sm:px-3 py-2 sm:py-2.5 rounded-full glass-card border border-primary/20 hover:border-primary/40 backdrop-blur-md bg-background/60 hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] cursor-pointer text-left w-full';

export const ContactSection = () => {
  const { toast } = useToast();
  const emailJsConfig = useMemo(() => getEmailJsConfig(), []);
  const contactEmailHint = useMemo(() => getContactEmailHint(), []);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitRef = useRef<number>(0);
  
  // Honeypot field - should remain empty (bots will fill it)
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (emailJsConfig?.publicKey) {
      emailjs.init(emailJsConfig.publicKey);
    }
  }, [emailJsConfig?.publicKey]);

  const validateForm = useCallback((): boolean => {
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
    
    setFormErrors({});
    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot - if filled, it's a bot
    if (honeypot) {
      // Silently fail for bots
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon!",
      });
      return;
    }
    
    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitRef.current)) / 1000);
      toast({
        title: "Please wait",
        description: `You can send another message in ${remainingSeconds} seconds.`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }
    
    if (!emailJsConfig) {
      toast({
        title: 'Contact form unavailable',
        description:
          'This form is not configured in this environment. Please use the links on the left.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const templateParams: Record<string, string> = {
        from_name: formData.name.trim(),
        from_email: formData.email.trim(),
        message: formData.message.trim(),
      };
      if (emailJsConfig.toEmail) {
        templateParams.to_email = emailJsConfig.toEmail;
      }

      const response = await emailjs.send(
        emailJsConfig.serviceId,
        emailJsConfig.templateId,
        templateParams,
        emailJsConfig.publicKey,
      );

      // Verify successful response
      if (response.status === 200) {
        // Update rate limit timestamp on successful submission
        lastSubmitRef.current = Date.now();
        
        toast({
          title: "Message sent!",
          description: "Thank you for reaching out. I'll get back to you soon!",
        });
        setFormData({ name: '', email: '', message: '' });
        setFormErrors({});
        setHoneypot(''); // Reset honeypot
      } else {
        throw new Error(`EmailJS returned status ${response.status}`);
      }
    } catch (error) {
      // Log error for debugging (in production, use proper error tracking)
      if (import.meta.env.DEV) {
        console.error('Email sending error:', error);
      }
      
      const fallbackContact = contactEmailHint
        ? `Please try again or contact me directly at ${contactEmailHint}`
        : 'Please try again or use the contact links on this page.';
      let errorMessage = fallbackContact;
      if (error instanceof Error) {
        if (error.message.includes('Invalid public key') || error.message.includes('Invalid service ID')) {
          errorMessage = contactEmailHint
            ? `Email service configuration error. Please contact me directly at ${contactEmailHint}`
            : 'Email service configuration error. Please use the contact links on this page.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      toast({
        title: "Error sending message",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-20 md:py-28 relative overflow-hidden min-h-[50vh]"
      ref={sectionRef}
    >
      <div className="absolute inset-0 z-0 bg-section-elevated" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
        <div
          className="absolute right-[-8%] top-[28%] h-[min(52vh,28rem)] w-[min(92vw,44rem)] rounded-full blur-[68px] sm:blur-[84px]"
          style={{
            background:
              'radial-gradient(circle at 62% 42%, hsl(187 54% 48% / 0.09) 0%, hsl(187 54% 48% / 0.025) 45%, transparent 62%)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div
          className={`text-center mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto ${
            isSectionVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}
        >
          <h2
            id="contact-heading"
            className={`font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-5 px-4 ${
              isSectionVisible ? 'animate-text-reveal stagger-delay-1' : 'opacity-0'
            }`}
          >
            {contactCtaContent.heading}
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg text-foreground/90 leading-relaxed px-4 mb-6 max-w-2xl mx-auto [text-wrap:balance] ${
              isSectionVisible ? 'animate-fade-in-up stagger-delay-2' : 'opacity-0'
            }`}
          >
            {contactCtaContent.supporting}
          </p>
          <ul
            className={`flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-3 text-xs sm:text-sm text-foreground/88 list-none m-0 p-0 ${
              isSectionVisible ? 'animate-fade-in-up stagger-delay-3' : 'opacity-0'
            }`}
          >
            <li className="inline-flex items-center gap-2 rounded-full border border-border/70 glass-card px-3.5 py-2.5 min-h-[44px] shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden />
              <span>NDAs &amp; confidentiality respected</span>
            </li>
            <li className="inline-flex items-center gap-2 rounded-full border border-border/70 glass-card px-3.5 py-2.5 min-h-[44px] shadow-sm">
              <Clock className="w-4 h-4 text-primary shrink-0" aria-hidden />
              <span>{contactCtaContent.replyWindow}</span>
            </li>
            <li className="inline-flex items-center gap-2 rounded-full border border-border/70 glass-card px-3.5 py-2.5 min-h-[44px] shadow-sm">
              <Lock className="w-4 h-4 text-primary shrink-0" aria-hidden />
              <span>Form data used only to reply, never sold</span>
            </li>
          </ul>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className={`space-y-5 sm:space-y-6 md:space-y-8 flex flex-col justify-center ${
            isSectionVisible ? 'animate-slide-in-left' : 'opacity-0'
          }`}>
            {/* Social Links - Enhanced */}
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground">Find Me Here</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-5 sm:mb-6 md:mb-8">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
                    data-analytics-button=""
                    data-analytics-label={`${label} (social)`}
                    className={socialLinkClassName}
                    aria-label={`${label} (opens in new tab)`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/90 group-hover:text-primary transition-colors flex-shrink-0" aria-hidden />
                    <span className="text-[10px] sm:text-xs md:text-sm text-primary/90 font-medium group-hover:text-primary transition-colors whitespace-nowrap">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 pl-1.5 sm:pl-2 pr-1.5 sm:pr-2 py-0.5 sm:py-1 rounded-full glass-card border border-primary/20 backdrop-blur-md bg-background/60 whitespace-nowrap w-fit">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50 flex-shrink-0" aria-hidden />
                <span className="text-xs sm:text-sm text-primary font-medium">Open for selective new work</span>
              </div>
              <p className="text-xs text-foreground/78 max-w-sm">{contactCtaContent.replyWindow}</p>
            </div>
          </div>

          {/* Contact Form - Enhanced with 3D */}
          <form onSubmit={handleSubmit} className={`glass-card p-4 sm:p-6 md:p-8 lg:p-10 rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/70 hover:border-border transform-3d shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group ${
            isSectionVisible ? 'animate-slide-in-right stagger-delay-4' : 'opacity-0'
          }`}>
            <div className="relative z-10">
              {/* Form Header - Secure message */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground">Drop Me a Line</h3>
                <div className="inline-flex items-center gap-1.5 text-xs text-foreground/80 ml-auto">
                  <Lock className="w-3.5 h-3.5 text-primary/80" />
                  <span>Secure message</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-foreground/78 mb-4 sm:mb-5 leading-relaxed">
                Details used only to respond. Never shared.{' '}
                <RouterNavButton
                  to="/privacy"
                  className="inline text-primary underline underline-offset-2 hover:text-primary/90 p-0 font-inherit align-baseline"
                >
                  Privacy Policy
                </RouterNavButton>
              </p>

              {!emailJsConfig && (
                <p className="text-xs sm:text-sm text-foreground/85 mb-4 p-3 rounded-lg border border-border bg-muted/40">
                  Form is visible, but email delivery is not configured in this environment yet.
                </p>
              )}

              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Honeypot field - hidden from users, visible to bots */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2 md:mb-3">
                    Your Name <span className="text-primary/90">*</span>
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                    }}
                    placeholder="Your name"
                    maxLength={100}
                    required
                    className={`h-10 sm:h-11 md:h-12 bg-secondary/50 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 text-sm sm:text-base hover:border-primary/30 ${formErrors.name ? 'border-destructive' : ''}`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive mt-1">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2 md:mb-3">
                    Email Address <span className="text-primary/90">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                    }}
                    placeholder="you@company.com"
                    maxLength={255}
                    required
                    className={`h-10 sm:h-11 md:h-12 bg-secondary/50 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 text-sm sm:text-base hover:border-primary/30 ${formErrors.email ? 'border-destructive' : ''}`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2 md:mb-3">
                    Your Message <span className="text-primary/90">*</span>
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (formErrors.message) setFormErrors({ ...formErrors, message: undefined });
                    }}
                    placeholder="What's on your mind? Project idea, question, or just say hi."
                    rows={5}
                    maxLength={2000}
                    required
                    className={`bg-secondary/50 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background resize-none transition-all duration-300 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] text-sm sm:text-base hover:border-primary/30 ${formErrors.message ? 'border-destructive' : ''}`}
                  />
                  {formErrors.message && (
                    <p className="text-xs text-destructive mt-1">{formErrors.message}</p>
                  )}
                </div>
                
                <div className="pt-1">
                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] h-11 sm:h-11 md:h-12 gap-2 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group/btn font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transform-3d hover:translate-y-[-2px] hover:translate-z-15 active:scale-95"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
