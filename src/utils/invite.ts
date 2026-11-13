const INVITE_CODE_LENGTH = 8;
const INVITE_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;

export function normalizeInviteCode(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, INVITE_CODE_LENGTH);
}

export function isInviteCode(code: string): boolean {
  return INVITE_CODE_PATTERN.test(code);
}

export function formatInviteCode(code: string): string {
  const normalized = normalizeInviteCode(code);

  return normalized.length > 4
    ? `${normalized.slice(0, 4)}-${normalized.slice(4)}`
    : normalized;
}
