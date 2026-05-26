import { z } from 'zod';
import { buildCalendlyPrefillUrl } from '@/lib/chatbot/buildCalendlyUrl';
import { chatbotCopy } from '@/data/siteContent';
import type { ScheduleFlowState } from '@/lib/chatbot/types';

const nameSchema = z
  .string()
  .trim()
  .min(2, chatbotCopy.schedule.errors.nameMin)
  .max(100, chatbotCopy.schedule.errors.nameMax);

const emailSchema = z
  .string()
  .trim()
  .email(chatbotCopy.schedule.errors.emailInvalid)
  .max(255, chatbotCopy.schedule.errors.emailMax);

export function getSchedulePrompt(state: ScheduleFlowState): string {
  switch (state.step) {
    case 'idle':
      return chatbotCopy.schedule.prompts.start;
    case 'name':
      return chatbotCopy.schedule.prompts.name;
    case 'email':
      return chatbotCopy.schedule.prompts.email;
    case 'topic':
      return chatbotCopy.schedule.prompts.topic;
    case 'timezone':
      return chatbotCopy.schedule.prompts.timezone;
    case 'complete':
      return chatbotCopy.schedule.prompts.complete(state.name, state.topic);
    default:
      return chatbotCopy.schedule.prompts.start;
  }
}

export function startScheduleFlow(): ScheduleFlowState {
  return { step: 'name' };
}

export function advanceScheduleFlow(
  state: ScheduleFlowState,
  input: string,
  calendlyBaseUrl: string,
): { state: ScheduleFlowState; error?: string; done?: boolean } {
  const value = input.trim();

  if (state.step === 'name') {
    const parsed = nameSchema.safeParse(value);
    if (!parsed.success) {
      return { state, error: parsed.error.errors[0]?.message ?? chatbotCopy.schedule.errors.nameMin };
    }
    return { state: { step: 'email', name: parsed.data } };
  }

  if (state.step === 'email') {
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) {
      return { state, error: parsed.error.errors[0]?.message ?? chatbotCopy.schedule.errors.emailInvalid };
    }
    return { state: { step: 'topic', name: state.name, email: parsed.data } };
  }

  if (state.step === 'topic') {
    const topic = value.length > 0 ? value.slice(0, 300) : 'General inquiry';
    return { state: { step: 'timezone', name: state.name, email: state.email, topic } };
  }

  if (state.step === 'timezone') {
    const timezone = value.length > 0 ? value.slice(0, 80) : 'Not specified';
    const calendlyUrl = buildCalendlyPrefillUrl(calendlyBaseUrl, {
      name: state.name,
      email: state.email,
      topic: `${state.topic} (Timezone: ${timezone})`,
    });
    return {
      state: {
        step: 'complete',
        name: state.name,
        email: state.email,
        topic: state.topic,
        timezone,
        calendlyUrl,
      },
      done: true,
    };
  }

  return { state };
}

export function isScheduleActive(state: ScheduleFlowState): boolean {
  return state.step !== 'idle' && state.step !== 'complete';
}
