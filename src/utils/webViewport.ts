import { Platform } from "react-native";

const env = globalThis as any;

function setup() {
  const doc = env.document;
  const viewport = env.visualViewport;
  if (!doc?.body || !viewport) return;

  const body = doc.body;

  const apply = () => {
    const keyboardOpen = env.innerHeight - viewport.height > 100;
    if (keyboardOpen) {
      body.style.top = `${Math.round(viewport.offsetTop)}px`;
      body.style.bottom = "auto";
      body.style.height = `${Math.round(viewport.height)}px`;
    } else {
      body.style.top = "0px";
      body.style.bottom = "0px";
      body.style.height = "100%";
    }
  };

  viewport.addEventListener("resize", apply);
  viewport.addEventListener("scroll", apply);

  doc.addEventListener("focusin", (event: any) => {
    const target = event.target;
    if (!target || !/^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
    env.setTimeout(() => {
      apply();
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 350);
  });

  doc.addEventListener("focusout", () => {
    env.setTimeout(apply, 100);
  });
}

if (Platform.OS === "web" && env.document) {
  if (env.document.readyState === "loading") {
    env.document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
}
