import { readFileSync, writeFileSync } from "node:fs";

const file = "dist/index.html";
let html = readFileSync(file, "utf8");

if (html.includes('rel="manifest"')) {
  console.log("index.html já tem as tags do PWA");
  process.exit(0);
}

const tags = [
  '<meta name="theme-color" content="#3D9E86" />',
  '<link rel="manifest" href="/manifest.json" />',
  '<link rel="icon" type="image/png" href="/favicon.png" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-title" content="Zelo" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  "<style>html,body{background-color:#FFFFFF;overscroll-behavior:none}</style>",
].join("\n    ");

html = html.replace(
  /<meta name="viewport"[^>]*>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />',
);

if (!/<title>/i.test(html)) {
  html = html.replace("</head>", "    <title>Zelo</title>\n  </head>");
}

html = html.replace("</head>", `    ${tags}\n  </head>`);

writeFileSync(file, html);
console.log("tags do PWA adicionadas em dist/index.html");
