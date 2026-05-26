import emailjs from '@emailjs/browser';
import { getEmailJsConfig } from '@/lib/emailjsConfig';

export type MeetingIntentPayload = {
  name: string;
  email: string;
  topic: string;
  timezone: string;
};

/** Notify site owner of a chatbot-led meeting intent (optional, uses EmailJS). */
export async function sendMeetingIntentEmail(payload: MeetingIntentPayload): Promise<boolean> {
  const config = getEmailJsConfig();
  if (!config) return false;

  const message = [
    '[Chatbot meeting request]',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Topic: ${payload.topic}`,
    `Timezone: ${payload.timezone}`,
    '',
    'Visitor may complete booking on Calendly.',
  ].join('\n');

  const templateParams: Record<string, string> = {
    from_name: payload.name.trim(),
    from_email: payload.email.trim(),
    message,
  };
  if (config.toEmail) {
    templateParams.to_email = config.toEmail;
  }

  const response = await emailjs.send(
    config.serviceId,
    config.templateId,
    templateParams,
    config.publicKey,
  );

  return response.status === 200;
}
