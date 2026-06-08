import { lazy, Suspense, useEffect, useState } from 'react';

const ChatbotWidget = lazy(() =>
  import('@/components/chatbot/ChatbotWidget').then((m) => ({ default: m.ChatbotWidget })),
);

/**
 * Loads the chat widget after scroll or idle so chat knowledge stays off the critical path.
 */
export function DeferredChatbot() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;

    const reveal = () => setShow(true);

    const onScroll = () => {
      if (window.scrollY > 480) {
        reveal();
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    let idleId: number | undefined;
    let timerId: number | undefined;

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(reveal, { timeout: 5000 });
    } else {
      timerId = window.setTimeout(reveal, 2500);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [show]);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <ChatbotWidget />
    </Suspense>
  );
}
