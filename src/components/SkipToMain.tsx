/**
 * Visible when focused (keyboard / screen readers). Targets #main-content on each page.
 */
export function SkipToMain() {
  return (
    <button
      type="button"
      className="print:hidden fixed left-4 top-4 z-[100] translate-y-[-130%] focus:translate-y-0 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-transform duration-200"
      onClick={() => {
        const el = document.getElementById('main-content');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el?.focus();
      }}
    >
      Skip to main content
    </button>
  );
}
