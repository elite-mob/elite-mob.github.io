import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CalendarClock, Loader2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { chatbotCopy } from '@/data/siteContent';
import { sendChatMessage } from '@/lib/chatbot/chatApi';
import { classifyIntent } from '@/lib/chatbot/intentRouter';
import { loadKnowledgeChunks } from '@/lib/chatbot/knowledgeChunks';
import { retrieveContextChunks } from '@/lib/chatbot/retrieveContext';
import {
  advanceScheduleFlow,
  getSchedulePrompt,
  isScheduleActive,
  startScheduleFlow,
} from '@/lib/chatbot/scheduleFlow';
import { sendMeetingIntentEmail } from '@/lib/chatbot/sendMeetingIntent';
import type { ChatMessage, KnowledgeChunk, ScheduleFlowState } from '@/lib/chatbot/types';
import { getScheduleMeetingUrl } from '@/lib/scheduleMeeting';
import {
  logChatApiCall,
  logChatIntent,
  logChatOpen,
  logChatScheduleComplete,
} from '@/integrations/firebase/analytics';
import { getEmailJsConfig } from '@/lib/emailjsConfig';
import emailjs from '@emailjs/browser';
import { cn } from '@/lib/utils';

function newMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createAssistantMessage(content: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: newMessageId(), role: 'assistant', content, ...extra };
}

export const ChatbotWidget = () => {
  const inputId = useId();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef(`chat-${Date.now()}`);
  const scheduleUrl = useMemo(() => getScheduleMeetingUrl(), []);
  const [knowledgeChunks, setKnowledgeChunks] = useState<KnowledgeChunk[]>([]);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createAssistantMessage(chatbotCopy.welcome),
  ]);
  const [scheduleState, setScheduleState] = useState<ScheduleFlowState>({ step: 'idle' });
  const [isLoading, setIsLoading] = useState(false);

  const emailJsConfig = useMemo(() => getEmailJsConfig(), []);

  useEffect(() => {
    if (emailJsConfig?.publicKey) {
      emailjs.init(emailJsConfig.publicKey);
    }
  }, [emailJsConfig?.publicKey]);

  useEffect(() => {
    if (!open) return;
    void logChatOpen();
    void loadKnowledgeChunks().then(setKnowledgeChunks);
  }, [open]);

  useEffect(() => {
    const prefetch = () => void loadKnowledgeChunks().then(setKnowledgeChunks);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(prefetch, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const appendMessages = useCallback((...next: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...next]);
  }, []);

  const handleNavigate = useCallback(
    (target: string, label: string) => {
      if (target.startsWith('/#')) {
        navigate('/');
        requestAnimationFrame(() => {
          const id = target.replace('/#', '');
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      } else {
        navigate(target);
      }
      appendMessages(
        createAssistantMessage(`${chatbotCopy.navigatePrefix}${label}.`, {
          action: { type: 'navigate', href: target, label },
        }),
      );
    },
    [appendMessages, navigate],
  );

  const completeSchedule = useCallback(
    async (state: Extract<ScheduleFlowState, { step: 'complete' }>) => {
      appendMessages(
        createAssistantMessage(getSchedulePrompt(state), {
          action: {
            type: 'open_calendly',
            url: state.calendlyUrl,
            label: chatbotCopy.schedule.openCalendlyLabel,
          },
        }),
      );
      void logChatScheduleComplete();
      void sendMeetingIntentEmail({
        name: state.name,
        email: state.email,
        topic: state.topic,
        timezone: state.timezone,
      }).catch(() => undefined);
      setScheduleState({ step: 'idle' });
    },
    [appendMessages],
  );

  const runScheduleInput = useCallback(
    async (text: string) => {
      if (!scheduleUrl) {
        appendMessages(createAssistantMessage(chatbotCopy.scheduleUnavailable));
        setScheduleState({ step: 'idle' });
        return;
      }

      if (scheduleState.step === 'idle') {
        setScheduleState(startScheduleFlow());
        appendMessages(createAssistantMessage(chatbotCopy.schedule.prompts.name));
        return;
      }

      const result = advanceScheduleFlow(scheduleState, text, scheduleUrl);
      if (result.error) {
        appendMessages(createAssistantMessage(result.error));
        return;
      }

      setScheduleState(result.state);

      if (result.state.step === 'complete') {
        await completeSchedule(result.state);
        return;
      }

      appendMessages(createAssistantMessage(getSchedulePrompt(result.state)));
    },
    [appendMessages, completeSchedule, scheduleState, scheduleUrl],
  );

  const runProjectQa = useCallback(
    async (text: string, matchedProjectId?: string) => {
      setIsLoading(true);
      appendMessages(createAssistantMessage(chatbotCopy.thinking));
      try {
        const source = knowledgeChunks.length > 0 ? knowledgeChunks : await loadKnowledgeChunks();
        if (source !== knowledgeChunks) setKnowledgeChunks(source);
        let chunks = retrieveContextChunks(source, text);
        if (matchedProjectId) {
          const matched = source.find((c) => c.id === `project-${matchedProjectId}`);
          if (matched && !chunks.some((c) => c.id === matched.id)) {
            chunks = [matched, ...chunks].slice(0, 5);
          }
        }

        const { response, usedRemoteApi } = await sendChatMessage({
          message: text,
          chunks,
          conversationId: conversationIdRef.current,
        });
        if (usedRemoteApi) void logChatApiCall();

        setMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.content !== chatbotCopy.thinking);
          return [
            ...withoutThinking,
            createAssistantMessage(response.reply, { suggestedLinks: response.suggestedLinks }),
          ];
        });
      } catch {
        setMessages((prev) => {
          const withoutThinking = prev.filter((m) => m.content !== chatbotCopy.thinking);
          return [...withoutThinking, createAssistantMessage(chatbotCopy.apiUnavailable)];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessages, knowledgeChunks],
  );

  const processUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      appendMessages({ id: newMessageId(), role: 'user', content: trimmed });
      setInput('');

      if (isScheduleActive(scheduleState)) {
        void logChatIntent({ intent: 'schedule' });
        await runScheduleInput(trimmed);
        return;
      }

      const classification = classifyIntent(trimmed);
      void logChatIntent({ intent: classification.intent });

      switch (classification.intent) {
        case 'schedule':
          await runScheduleInput(trimmed);
          break;
        case 'navigate':
          if (classification.navigateTarget) {
            const label =
              classification.navigateTarget.replace('/#', '').replace('/', '') || 'section';
            handleNavigate(classification.navigateTarget, label);
          } else {
            appendMessages(createAssistantMessage(chatbotCopy.unclear));
          }
          break;
        case 'project':
          await runProjectQa(trimmed, classification.matchedProjectId);
          break;
        case 'unclear':
          appendMessages(createAssistantMessage(chatbotCopy.unclear));
          break;
        case 'off_topic':
        default:
          appendMessages(createAssistantMessage(chatbotCopy.offTopic));
          break;
      }
    },
    [
      appendMessages,
      handleNavigate,
      isLoading,
      runProjectQa,
      runScheduleInput,
      scheduleState,
    ],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void processUserMessage(input);
  };

  const handleQuickAction = (message: string) => {
    void processUserMessage(message);
  };

  const openCalendly = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="lg"
          className={cn(
            'fixed z-40 bottom-6 right-6 rounded-full shadow-lg gap-2',
            'min-h-[48px] px-4 sm:px-5',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'border border-primary/30',
          )}
          aria-label={chatbotCopy.launcherLabel}
          data-analytics-label="Open portfolio chatbot"
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
          <span className="hidden sm:inline font-medium">{chatbotCopy.launcherLabel}</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-md p-0 gap-0 border-primary/20"
        aria-describedby={`${inputId}-desc`}
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/50 shrink-0">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/15 p-2 shrink-0" aria-hidden>
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-left font-display">{chatbotCopy.title}</SheetTitle>
              <SheetDescription id={`${inputId}-desc`} className="text-left text-xs mt-1">
                {chatbotCopy.subtitle}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <ul className="py-4 space-y-4" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'glass-card border border-border/60 text-foreground/90 rounded-bl-md',
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.suggestedLinks && msg.suggestedLinks.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {msg.suggestedLinks.map((link) => (
                        <li key={link.href}>
                          <button
                            type="button"
                            className="text-primary text-xs underline underline-offset-2 hover:text-primary/80"
                            onClick={() => {
                              if (link.href.startsWith('/')) {
                                navigate(link.href);
                                setOpen(false);
                              } else {
                                window.open(link.href, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          >
                            {link.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {msg.action?.type === 'open_calendly' && (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3 w-full gap-2"
                      onClick={() => openCalendly(msg.action.url)}
                      data-analytics-label="Chatbot open Calendly"
                    >
                      <CalendarClock className="h-4 w-4" aria-hidden />
                      {msg.action.label}
                    </Button>
                  )}
                  {msg.action?.type === 'navigate' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        handleNavigate(msg.action.href, msg.action.label);
                        setOpen(false);
                      }}
                    >
                      {msg.action.label}
                    </Button>
                  )}
                </div>
              </li>
            ))}
            {isLoading && (
              <li className="flex justify-start">
                <div className="glass-card border border-border/60 rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-2 text-sm text-foreground/70">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  {chatbotCopy.thinking}
                </div>
              </li>
            )}
            <li ref={scrollRef} className="h-px" aria-hidden />
          </ul>
        </ScrollArea>

        <div className="shrink-0 border-t border-border/50 p-3 space-y-2 bg-background/80 backdrop-blur-sm">
          <div className="flex flex-wrap gap-1.5">
            {chatbotCopy.quickActions.map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full"
                disabled={isLoading}
                onClick={() => handleQuickAction(action.message)}
                data-analytics-label={`Chatbot quick: ${action.label}`}
              >
                {action.label}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <label htmlFor={inputId} className="sr-only">
              Message
            </label>
            <Input
              id={inputId}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about projects or book a call…"
              maxLength={500}
              disabled={isLoading}
              className="flex-1 min-h-[44px]"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 min-h-[44px] min-w-[44px]"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
