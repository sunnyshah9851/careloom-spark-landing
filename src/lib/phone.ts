// src/lib/phone.ts

// E.164 = "+" then 7–15 digits, first digit 1–9
export const isValidE164 = (value: string): boolean =>
  /^\+[1-9]\d{6,14}$/.test(value);

/**
 * Normalize user input to E.164 if possible.
 * - Trims
 * - "00" prefix -> "+"
 * - Removes all non-digits except a single leading "+"
 * - Adds "+" if they typed only digits
 * - Returns null if not valid E.164 (so you can block/save-null)
 */
export const normalizePhoneForDB = (input?: string | null): string | null => {
  if (!input) return null;
  let s = input.trim();
  if (!s) return null;

  // Convert leading "00" to "+"
  if (s.startsWith("00")) s = "+" + s.slice(2);

  // Keep one leading "+", strip all other non-digits
  s = s.replace(/(?!^\+)\D/g, "");

  // If it's digits only (no +), prefix "+"
  if (!s.startsWith("+") && /^\d+$/.test(s)) s = `+${s}`;

  // De-dupe accidental multiple pluses
  s = s.replace(/^\++/, "+");

  return isValidE164(s) ? s : null;
};

/** Helper: digits only for wa.me (no "+") */
const toDigitsForWa = (maybeE164: string): string => {
  const withPlus = maybeE164.startsWith("+") ? maybeE164.slice(1) : maybeE164;
  return withPlus.replace(/\D/g, "");
};

/** Build a WhatsApp deep link. Returns null if phone can't be normalized. */
export const buildWhatsAppLink = (phone: string, text?: string): string | null => {
  const normalized = normalizePhoneForDB(phone);
  if (!normalized) return null;
  const base = `https://wa.me/${toDigitsForWa(normalized)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
};

// ------- Back-compat with your earlier helper names -------
export const toWaPath = (maybeE164: string) => toDigitsForWa(maybeE164);
/** @deprecated Use buildWhatsAppLink instead */
export const whatsAppLink = (maybeE164: string, text?: string) =>
  buildWhatsAppLink(maybeE164, text) ?? "#";
