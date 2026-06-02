/** Prefix public folder paths with Vite `BASE_URL` and encode each path segment for img/src. */
export function publicAssetUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const decoded = decodeURIComponent(path.startsWith('/') ? path : `/${path}`);
  const segments = decoded.split('/').filter(Boolean);
  const encodedPath = `/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;

  const base = import.meta.env.BASE_URL;
  if (base === '/') return encodedPath;
  return `${base.replace(/\/$/, '')}${encodedPath}`;
}
