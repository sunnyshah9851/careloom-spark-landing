// Keep digits + optional leading '+'. Store in DB as E.164-like (e.g., +14155551234).
export const normalizePhoneForDB = (input?: string | null): string | null => {
  if (!input) return null;
  const cleaned = input.trim().replace(/[^\d+]/g, "");
  return cleaned || null;
};

// Build wa.me links later with this
export const toWaPath = (maybeE164: string) => {
  const noPlus = maybeE164.startsWith("+") ? maybeE164.slice(1) : maybeE164;
  return noPlus.replace(/[^\d]/g, "");
};

export const whatsAppLink = (maybeE164: string, text?: string) => {
  const base = `https://wa.me/${toWaPath(maybeE164)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};
