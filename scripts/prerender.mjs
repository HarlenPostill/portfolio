// Runs after `vite build` and `vite build --ssr`. Renders every route to static
// HTML so the page has its content without JavaScript, and writes /llms.txt
// from the same content the page shows.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const serverEntry = join(root, "dist-ssr", "entry-server.js");

const { render, paths, channels, socials, SPONSOR_EMAIL, TAGLINE } =
  await import(pathToFileURL(serverEntry).href);

const SITE = "https://www.hrln-interactive.com";
const template = readFileSync(join(dist, "index.html"), "utf8");
const marker = '<div id="root"></div>';
if (!template.includes(marker)) throw new Error(`${marker} not found`);

for (const path of paths) {
  const html = template.replace(
    marker,
    () => `<div id="root">${render(path)}</div>`,
  );
  const file =
    path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  console.log(`prerendered ${path}`);
}

const lines = [
  "# Harlen Postill",
  "",
  `> ${TAGLINE}`,
  "",
  `Personal site: ${SITE}/`,
  "",
];
for (const c of channels) {
  lines.push(`## ${c.label}`, "");
  for (const item of c.items) {
    const meta = [item.role, item.date].filter(Boolean).join(", ");
    lines.push(`- [${item.title}](${item.url}): ${meta}. ${item.description}`);
  }
  lines.push("");
}
lines.push(
  "## Contact",
  "",
  `- Email: ${SPONSOR_EMAIL} (for brand partnerships, sponsorships and collaborations)`,
  ...socials.map((s) => `- ${s.name}: ${s.href}`),
  "",
);
writeFileSync(join(dist, "llms.txt"), lines.join("\n"));
console.log("wrote llms.txt");

rmSync(join(root, "dist-ssr"), { recursive: true, force: true });
