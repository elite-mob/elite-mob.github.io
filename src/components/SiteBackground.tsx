/**
 * Fixed ambient canvas shared across all routes (mesh, grid, vignette).
 */
export function SiteBackground() {
  return (
    <div className="site-background pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="site-background__base" />
      <div className="site-background__mesh" />
      <div className="site-background__grid" />
      <div className="site-background__vignette" />
    </div>
  );
}
