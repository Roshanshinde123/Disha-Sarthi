// Disha Sarathi - WhatsApp Cloud API Service (PS 26097)
// SERVER-SIDE ONLY: This module must never be imported by Vite/React client code.
// The WHATSAPP_ACCESS_TOKEN is accessed exclusively here and is never logged.

import { createHash } from 'crypto';

const WA_API_VERSION = 'v21.0';
const WA_API_BASE = `https://graph.facebook.com/${WA_API_VERSION}`;

/**
 * Returns a one-way hash prefix for a sender ID suitable for structured logs.
 * Safe to log — does not reveal the actual phone number.
 */
export function senderLogTag(waId: string): string {
  return 'wa_' + createHash('sha256').update(waId).digest('hex').slice(0, 8);
}

/**
 * Reads and validates required WhatsApp env vars.
 * Throws if missing so callers get a clear error at startup.
 */
export function getWhatsAppConfig(): {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  verifyToken: string;
} {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || '';

  if (!accessToken || accessToken.trim().length === 0) {
    throw new Error('[WHATSAPP] WHATSAPP_ACCESS_TOKEN is not set in environment.');
  }
  if (!phoneNumberId || phoneNumberId.trim().length === 0) {
    throw new Error('[WHATSAPP] WHATSAPP_PHONE_NUMBER_ID is not set in environment.');
  }

  return { accessToken, phoneNumberId, businessAccountId, verifyToken };
}

/**
 * Returns true if WhatsApp credentials are configured.
 * Does NOT throw — safe to call at module load time.
 */
export function isWhatsAppConfigured(): boolean {
  const t = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const p = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  return t.trim().length > 0 && p.trim().length > 0;
}

/**
 * Returns safe diagnostics/status info with masked token for startup logs.
 */
export function getWhatsAppStatusInfo(): {
  isConfigured: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  verifyTokenConfigured: boolean;
  maskedToken: string;
} {
  const t = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const p = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  const b = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
  const v = process.env.WHATSAPP_VERIFY_TOKEN || '';

  return {
    isConfigured: t.trim().length > 0 && p.trim().length > 0,
    phoneNumberId: p,
    businessAccountId: b,
    verifyTokenConfigured: Boolean(v && v.trim().length > 0),
    maskedToken: t.length > 8 ? `...${t.slice(-4)}` : t ? '****' : 'NONE'
  };
}

/**
 * Sends a plain text message to a WhatsApp user.
 * Uses Meta Cloud API POST /{phone-number-id}/messages
 */
export async function sendTextMessage(to: string, text: string): Promise<void> {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text, preview_url: false }
  };

  const resp = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Token injected at call time, never stored in a variable that persists
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`[WHATSAPP] sendTextMessage HTTP ${resp.status}: ${errText}`);
  }
}

export interface WhatsAppReplyButton {
  id: string;
  title: string;
}

/**
 * Sends an Interactive Reply Buttons message (up to 3 buttons) to a WhatsApp user.
 * Uses Meta Cloud API POST /{phone-number-id}/messages with type: "interactive".
 */
export async function sendInteractiveButtonMessage(
  to: string,
  bodyText: string,
  buttons: WhatsAppReplyButton[],
  headerText?: string,
  footerText?: string
): Promise<void> {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();

  // Meta accepts maximum 3 reply buttons; button titles must be <= 20 chars
  const formattedButtons = buttons.slice(0, 3).map((btn) => ({
    type: 'reply',
    reply: {
      id: btn.id.slice(0, 256),
      title: btn.title.slice(0, 20)
    }
  }));

  const interactivePayload: Record<string, unknown> = {
    type: 'button',
    body: { text: bodyText },
    action: { buttons: formattedButtons }
  };

  if (headerText) {
    interactivePayload.header = { type: 'text', text: headerText.slice(0, 60) };
  }
  if (footerText) {
    interactivePayload.footer = { text: footerText.slice(0, 60) };
  }

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive: interactivePayload
  };

  const resp = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`[WHATSAPP] sendInteractiveButtonMessage HTTP ${resp.status}: ${errText}`);
  }
}

/**
 * Fetches metadata (download URL) for a WhatsApp media object.
 * Returns the HTTPS URL to download the media binary.
 */
export async function getMediaUrl(mediaId: string): Promise<string> {
  const { accessToken } = getWhatsAppConfig();

  const resp = await fetch(`${WA_API_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!resp.ok) {
    throw new Error(`[WHATSAPP] getMediaUrl HTTP ${resp.status} for media ${mediaId}`);
  }

  const data = (await resp.json()) as { url?: string };
  if (!data.url) {
    throw new Error(`[WHATSAPP] getMediaUrl: no url in response for media ${mediaId}`);
  }

  return data.url;
}

/**
 * Downloads a WhatsApp media binary using its URL.
 * URL must have been obtained from getMediaUrl() — requires auth header.
 */
export async function downloadMedia(mediaUrl: string): Promise<Buffer> {
  const { accessToken } = getWhatsAppConfig();

  const resp = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!resp.ok) {
    throw new Error(`[WHATSAPP] downloadMedia HTTP ${resp.status}`);
  }

  const arrayBuf = await resp.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Uploads an audio buffer to Meta's media API and sends it as a voice note.
 * @param to  - WhatsApp recipient ID
 * @param audioBuffer - Raw audio bytes (WAV/OGG/MP3)
 * @param mimeType - MIME type of audioBuffer, e.g. 'audio/ogg; codecs=opus'
 */
export async function sendAudioMessage(
  to: string,
  audioBuffer: Buffer,
  mimeType: string = 'audio/ogg; codecs=opus'
): Promise<void> {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();

  // Meta Cloud API accepts: audio/aac, audio/mp4, audio/mpeg, audio/amr, audio/ogg (with opus)
  let metaMimeType = 'audio/ogg';
  let ext = 'ogg';

  if (mimeType.includes('ogg') || mimeType.includes('opus')) {
    metaMimeType = 'audio/ogg';
    ext = 'ogg';
  } else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) {
    metaMimeType = 'audio/mpeg';
    ext = 'mp3';
  } else if (mimeType.includes('aac')) {
    metaMimeType = 'audio/aac';
    ext = 'aac';
  } else if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
    metaMimeType = 'audio/mp4';
    ext = 'm4a';
  } else if (mimeType.includes('amr')) {
    metaMimeType = 'audio/amr';
    ext = 'amr';
  } else {
    metaMimeType = 'audio/ogg';
    ext = 'ogg';
  }

  const filename = `voice_reply.${ext}`;

  // Step 1: Upload media to Meta to get a media ID
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append(
    'file',
    new Blob([new Uint8Array(audioBuffer)], { type: metaMimeType }),
    filename
  );
  formData.append('type', metaMimeType);

  const uploadResp = await fetch(`${WA_API_BASE}/${phoneNumberId}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData
  });

  if (!uploadResp.ok) {
    const errText = await uploadResp.text().catch(() => '');
    throw new Error(`[WHATSAPP] sendAudioMessage upload HTTP ${uploadResp.status}: ${errText}`);
  }

  const uploadData = (await uploadResp.json()) as { id?: string };
  if (!uploadData.id) {
    throw new Error('[WHATSAPP] sendAudioMessage: no media id from upload response');
  }

  // Step 2: Send the uploaded media as an audio message
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'audio',
    audio: { id: uploadData.id }
  };

  const sendResp = await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  if (!sendResp.ok) {
    const errText = await sendResp.text().catch(() => '');
    throw new Error(`[WHATSAPP] sendAudioMessage send HTTP ${sendResp.status}: ${errText}`);
  }
}

/**
 * Marks an incoming message as read (sends read receipt to Meta).
 */
export async function markMessageRead(messageId: string): Promise<void> {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();

  const body = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId
  };

  await fetch(`${WA_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  }).catch(() => {
    // Best-effort — don't fail the main flow if read receipt fails
  });
}
