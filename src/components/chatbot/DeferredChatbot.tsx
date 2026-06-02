import { lazy, Suspense, useEffect, useState } from 'react';

const ChatbotWidget = lazy(() =>
  import('@/components/chatbot/ChatbotWidget').then((m) => ({ default: m.ChatbotWidget })),
);

/**
 * Loads the chat widget after first paint so chat knowledge + EmailJS stay off the critical path.
 */
export function DeferredChatbot() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const load = () => setShow(true);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(load, { timeout: 3500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(load, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <ChatbotWidget />
    </Suspense>
  );
}
