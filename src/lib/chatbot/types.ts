export type ChatIntent = 'off_topic' | 'project' | 'schedule' | 'navigate' | 'unclear';

export type KnowledgeChunk = {
  id: string;
  title: string;
  text: string;
  href?: string;
  keywords: string[];
};

export type SuggestedLink = {
  label: string;
  href: string;
};

export type ChatApiResponse = {
  reply: string;
  suggestedLinks?: SuggestedLink[];
};

export type ChatMessageRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  content: string;
  suggestedLinks?: SuggestedLink[];
  action?: ChatMessageAction;
};

export type ChatMessageAction =
  | { type: 'open_calendly'; url: string; label: string }
  | { type: 'navigate'; href: string; label: string };

export type ScheduleFlowState =
  | { step: 'idle' }
  | { step: 'name' }
  | { step: 'email'; name: string }
  | { step: 'topic'; name: string; email: string }
  | { step: 'timezone'; name: string; email: string; topic: string }
  | {
      step: 'complete';
      name: string;
      email: string;
      topic: string;
      timezone: string;
      calendlyUrl: string;
    };
