import { useSyncExternalStore } from "react";
import { Platform } from "react-native";
import {
  useSafeAreaInsets,
  type EdgeInsets,
} from "react-native-safe-area-context";

const ZERO: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const env = globalThis as any;

let current = ZERO;
let probe: any = null;
let started = false;
const listeners = new Set<() => void>();

function ensureViewportCover() {
  const meta = env.document?.querySelector('meta[name="viewport"]');
  if (!meta) return;
  const content: string = meta.getAttribute("content") ?? "";
  if (!content.includes("viewport-fit")) {
    meta.setAttribute("content", `${content}, viewport-fit=cover`);
  }
}

function read(): EdgeInsets {
  const doc = env.document;
  if (!doc?.body) return ZERO;
  if (!probe) {
    ensureViewportCover();
    probe = doc.createElement("div");
    probe.style.cssText =
      "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
      "padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)";
    doc.body.appendChild(probe);
  }
  const style = env.getComputedStyle(probe);
  const px = (value: string) => Math.round(parseFloat(value) || 0);
  return {
    top: px(style.paddingTop),
    right: px(style.paddingRight),
    bottom: px(style.paddingBottom),
    left: px(style.paddingLeft),
  };
}

function refresh() {
  const next = read();
  if (
    next.top === current.top &&
    next.right === current.right &&
    next.bottom === current.bottom &&
    next.left === current.left
  ) {
    return;
  }
  current = next;
  listeners.forEach((listener) => listener());
}

function start() {
  if (started) return;
  started = true;
  env.addEventListener("resize", refresh);
  env.addEventListener("orientationchange", refresh);
  env.addEventListener("pageshow", refresh);
  env.document?.addEventListener("visibilitychange", refresh);
  [0, 300, 1000, 3000].forEach((delay) => env.setTimeout(refresh, delay));
}

function subscribe(listener: () => void) {
  if (Platform.OS !== "web") return () => {};
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return current;
}

function getServerSnapshot() {
  return ZERO;
}

export function useInsets(): EdgeInsets {
  const lib = useSafeAreaInsets();
  const web = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (Platform.OS !== "web") return lib;
  return {
    top: Math.max(lib.top, web.top),
    right: Math.max(lib.right, web.right),
    bottom: Math.max(lib.bottom, web.bottom),
    left: Math.max(lib.left, web.left),
  };
}
