import { Platform } from "react-native";

import { request } from "@/services/api";
import type { Profile } from "@/services/auth";

export type PushStatus =
  | "unsupported"
  | "needs-install"
  | "blocked"
  | "off"
  | "on";

const SW_URL = "/sw.js";

export const PUSH_HINTS: Record<
  "unsupported" | "needs-install" | "blocked",
  { title: string; message: string }
> = {
  unsupported: {
    title: "Este navegador não permite avisos",
    message: "Abra o Zelo no Chrome (Android) ou no Safari (iPhone).",
  },
  "needs-install": {
    title: "Instale o Zelo primeiro",
    message:
      "No Safari, toque em Compartilhar, depois em Adicionar à Tela de Início, e abra o Zelo por lá.",
  },
  blocked: {
    title: "Avisos bloqueados",
    message:
      "Libere as notificações do Zelo nas configurações do navegador ou do celular.",
  },
};

const subscriptionPath = (profile: Profile) =>
  profile === "patient" ? "/patient/push/subscriptions" : "/push/subscriptions";

const scope = (): any => globalThis as any;

function isIos() {
  const nav = scope().navigator;
  if (!nav) return false;
  return (
    /iphone|ipad|ipod/i.test(nav.userAgent ?? "") ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
}

function isInstalled() {
  const g = scope();
  return (
    g.navigator?.standalone === true ||
    g.matchMedia?.("(display-mode: standalone)")?.matches === true
  );
}

function canPush() {
  const g = scope();
  return (
    Platform.OS === "web" &&
    !!g.navigator &&
    "serviceWorker" in g.navigator &&
    "PushManager" in g &&
    "Notification" in g
  );
}

function toApplicationServerKey(base64: string) {
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

async function getRegistration(): Promise<any> {
  return scope().navigator.serviceWorker.getRegistration("/");
}

async function ensureRegistration(): Promise<any> {
  const { serviceWorker } = scope().navigator;
  await serviceWorker.register(SW_URL, { scope: "/" });
  return serviceWorker.ready;
}

export async function getPushStatus(): Promise<PushStatus> {
  if (Platform.OS !== "web") return "unsupported";
  if (!canPush()) return isIos() && !isInstalled() ? "needs-install" : "unsupported";
  if (scope().Notification.permission === "denied") return "blocked";
  if (scope().Notification.permission !== "granted") return "off";

  try {
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    return subscription ? "on" : "off";
  } catch {
    return "off";
  }
}

export async function enablePush(profile: Profile): Promise<void> {
  if (!canPush()) {
    const hint = isIos() && !isInstalled() ? "needs-install" : "unsupported";
    throw new Error(PUSH_HINTS[hint].message);
  }

  const permission = await scope().Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(PUSH_HINTS.blocked.message);
  }

  const { publicKey } = await request<{ publicKey: string }>(
    "GET",
    "/push/public-key",
    { auth: false },
  );

  const registration = await ensureRegistration();
  const key = toApplicationServerKey(publicKey);

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
    } catch {
      throw new Error("Não foi possível ativar os avisos neste aparelho.");
    }
  }

  await request("POST", subscriptionPath(profile), {
    body: subscription.toJSON(),
  });
}

export async function disablePush(profile: Profile): Promise<void> {
  if (!canPush()) return;

  const registration = await getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await request(
      "DELETE",
      `${subscriptionPath(profile)}?endpoint=${encodeURIComponent(subscription.endpoint)}`,
    );
  } catch {}

  await subscription.unsubscribe();
}

export async function syncPushDevice(profile: Profile): Promise<void> {
  try {
    if (!canPush() || scope().Notification.permission !== "granted") return;

    const registration = await ensureRegistration();
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await request("POST", subscriptionPath(profile), {
      body: subscription.toJSON(),
    });
  } catch {}
}

const FORGET_TIMEOUT_MS = 3000;

export async function forgetPushDevice(profile: Profile): Promise<void> {
  const timeout = new Promise<void>((resolve) =>
    setTimeout(resolve, FORGET_TIMEOUT_MS),
  );

  await Promise.race([disablePush(profile).catch(() => undefined), timeout]);
}
