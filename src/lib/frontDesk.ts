// Copies a website form submission to Homefront's Front Desk (Lead Intake).
// Fire-and-forget: it never blocks or changes the Web3Forms email, and any
// failure here is ignored so a form can never break because of it.
const INTAKE_URL = 'https://homefront-front-desk.vercel.app/api/intake';
const SKIP = new Set(['access_key', 'botcheck', 'from_name', 'redirect', 'replyto']);

export function sendToFrontDesk(data: FormData, form: string): void {
  try {
    if (data.get('botcheck')) return; // spam trap filled in: a bot
    const fields: Record<string, string> = {};
    data.forEach((value, key) => {
      if (SKIP.has(key) || typeof value !== 'string') return;
      const v = value.trim();
      if (v) fields[key] = v.slice(0, 2000);
    });
    const body = JSON.stringify({ form, page: window.location.pathname, fields });
    // text/plain keeps this a simple request (no preflight); keepalive lets it finish if the page changes
    fetch(INTAKE_URL, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' } }).catch(() => {});
  } catch {
    /* never interfere with the form */
  }
}
