import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_KEY = "zelo:pending-invite";

export function extractInviteToken(text: string): string | null {
  const last = text.trim().split(/[?#]/)[0].split("/").filter(Boolean).pop();

  return last && /^[A-Za-z0-9_-]{20,}$/.test(last) ? last : null;
}

export async function savePendingInvite(token: string) {
  try {
    await AsyncStorage.setItem(PENDING_KEY, token);
  } catch {}
}

export async function takePendingInvite(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(PENDING_KEY);
    if (token) await AsyncStorage.removeItem(PENDING_KEY);
    return token;
  } catch {
    return null;
  }
}

export async function clearPendingInvite() {
  try {
    await AsyncStorage.removeItem(PENDING_KEY);
  } catch {}
}
