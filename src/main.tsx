import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFirebaseAnalytics } from "./integrations/firebase/analytics";

// Disable right-click (context menu) globally
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
}, false);

// Disable dragging globally on all elements
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
}, false);

// Disable text selection on decorative UI; allow copying in main content, footer, articles, and forms
document.addEventListener('selectstart', (e) => {
  const target = e.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable ||
    target.closest('input, textarea, [contenteditable="true"]')
  ) {
    return true;
  }
  if (
    target.closest('main, footer, article, [data-allow-select]')
  ) {
    return true;
  }
  e.preventDefault();
  return false;
}, false);

void initFirebaseAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
