#!/usr/bin/env node
// Single source of truth for the Redmark Forge Sandbox page shell.
//   node tools/apply-shell.mjs          rewrite the shared chrome + <head> block in every page (idempotent)
//   node tools/apply-shell.mjs --check  exit 1 if any page differs from what this script would generate
// To add a destination, add it to DESTINATIONS, create the page with <body> and <main>, run this script.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SITE = "Redmark Forge Sandbox";

export const GROUPS = [
  { id: "create", label: "Create & share" },
  { id: "analysis", label: "Analysis labs" },
  { id: "research", label: "Research" },
  { id: "personality", label: "Personality labs" }
];

// file, nav label, page title, icon, group, meta description (used only if the page has none)
export const DESTINATIONS = [
  ["index.html", "Steganography Studio", "Steganography Studio", "◈", "create", "Browser-first steganography, payload containers, metadata inspection, watermarking and integrity checks."],
  ["redmarkshare.html", "RedmarkShare · P2P", "RedmarkShare", "⇄", "create", "Browser-based peer-to-peer file transfer with chunked sharing and QR handoff."],
  ["forensics.html", "Digital Forensics Studio", "Digital Forensics Studio", "⌕", "analysis", "Browser-local file triage: signatures, bytes, strings, entropy, hashes and comparison."],
  ["cryptography.html", "Cryptography Lab", "Cryptography Lab", "♙", "analysis", "Browser-local cryptography experiments and encodings."],
  ["image-forensics.html", "Image Forensics Studio", "Image Forensics Studio", "▧", "analysis", "Browser-local image analysis and forensic inspection tools."],
  ["entropy-information.html", "Entropy & Information Studio", "Entropy & Information Studio", "∑", "analysis", "Entropy and information-theory measurements for files and text."],
  ["audio-signal.html", "Audio Signal Studio", "Audio Signal Studio", "♫", "analysis", "Load, visualise, measure, transform and export audio signals in the browser."],
  ["protocol-packet.html", "Protocol & Packet Lab", "Protocol & Packet Lab", "⌁", "analysis", "Inspect protocol and packet structures in the browser."],
  ["visual-encoding.html", "Visual Encoding Studio", "Visual Encoding Studio", "▦", "analysis", "Encode and decode data as visual patterns."],
  ["binary-diff.html", "Binary Diff Studio", "Binary Diff Studio", "⇄", "analysis", "Compare binary files byte by byte."],
  ["data-sonification.html", "Data Sonification Studio", "Data Sonification Studio", "♪", "analysis", "Turn data into sound."],
  ["file-format-explorer.html", "File Format Explorer", "File Format Explorer", "▤", "analysis", "Explore file format structures and signatures."],
  ["error-correction.html", "Error Correction Studio", "Error Correction Studio", "⌁", "analysis", "Experiment with error-correcting codes."],
  ["robustness.html", "Robustness Testing Studio", "Robustness Testing Studio", "▧", "analysis", "Test how data survives common transformations."],
  ["osint.html", "OSINT Studio", "OSINT Studio", "◎", "research", "Browser-only OSINT workbench: query builder, mini browser, domain lookups and a local casebook."],
  ["web-scraping.html", "Web Scraping Studio", "Web Scraping Studio", "⌁", "research", "Extract structured records from permitted public HTML pages or saved files and export CSV or JSON."],
  ["ops-studio.html", "OPS Research Lab", "OPS Research Lab", "◈", "research", "OPS Research Lab: source-indexed knowledge base, type-code workbench, visual map, research notes and evidence cases."],
  ["big-five-studio.html", "Big Five Studio", "Big Five Studio", "◉", "personality", "Explore five broad personality dimensions with a short self-reflection questionnaire."],
  ["mbti-studio.html", "MBTI Studio", "MBTI Studio", "◇", "personality", "Explore four preference pairs with a short forced-choice exercise; not an official MBTI result."],
  ["disc-studio.html", "DISC Studio", "DISC Studio", "▦", "personality", "Explore Dominance, Influence, Steadiness and Conscientiousness using practical scenarios."]
].map(([file, label, title, icon, group, blurb]) => ({ file, label, title, icon, group, blurb }));

const CHROME_START = "<!--rf:chrome-->";
const CHROME_END = "<!--/rf:chrome-->";
const HEAD_START = "<!--rf:head-->";
const HEAD_END = "<!--/rf:head-->";
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildChrome(file) {
  const n = DESTINATIONS.length;
  const items = GROUPS.map(g => {
    const links = DESTINATIONS.filter(d => d.group === g.id).map(d => {
      const active = d.file === file;
      return `<a class="rf-link${active ? " is-active" : ""}" href="${d.file}"${active ? ' aria-current="page"' : ""}><span class="rf-ico" aria-hidden="true">${d.icon}</span>${esc(d.label)}</a>`;
    }).join("");
    return `<div class="rf-group">${esc(g.label)}</div>${links}`;
  }).join("");
  return `${CHROME_START}
<a class="rf-skip" href="#rf-main">Skip to content</a>
<header class="rf-topbar"><button class="rf-menu-btn" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="rf-side">☰</button><a class="rf-brand" href="index.html"><span class="rf-mark" aria-hidden="true">RF</span><span class="rf-brand-text"><strong>REDMARK FORGE <span>SANDBOX</span></strong><small>Private-by-design browser tools</small></span></a><div class="rf-top-actions"><span class="rf-pill"><span class="rf-dot" aria-hidden="true"></span>LOCAL PROCESSING</span><span class="rf-pill">v1.0 · EXPERIMENTAL</span></div></header>
<div class="rf-scrim" hidden></div>
<aside class="rf-side" id="rf-side" aria-label="Sandbox navigation"><nav class="rf-nav" aria-label="Sandbox destinations">${items}</nav><div class="rf-side-foot"><strong>${n} independent destinations.</strong>Each tool has its own page, controls, state and logic. Browser-first processing; no studio-to-studio runtime dependency.</div></aside>
${CHROME_END}`;
}

export function buildHeadBlock(dest, existingDescription) {
  const desc = existingDescription || dest.blurb;
  return `${HEAD_START}
<meta name="theme-color" content="#17202c">
<meta name="description" content="${esc(desc)}">
<title>${esc(dest.title)} · ${SITE}</title>
<link rel="icon" href="./favicon.svg?v=purple1" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Figtree:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
${HEAD_END}`;
}

export const HEAD_TAIL = `<!--rf:shell-->
<link rel="stylesheet" href="redmark-revamp.css?v=2">
<link rel="stylesheet" href="sandbox-shell.css?v=1">
<script src="sandbox-shell.js?v=1" defer></script>
<!--/rf:shell-->`;

const LEGACY_HEAD = [
  /<meta\s+name="theme-color"[^>]*>\s*/gi,
  /<link\s+rel="preconnect"[^>]*fonts\.g[^>]*>\s*/gi,
  /<link\s+href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/gi,
  /<link\s+rel="icon"[^>]*>\s*/gi,
  /<link\s+rel="stylesheet"\s+href="redmark-revamp\.css[^"]*">\s*/gi,
  /<link\s+rel="stylesheet"\s+href="sandbox-shell\.css[^"]*">\s*/gi,
  /<script\s+src="sandbox-shell\.js[^"]*"[^>]*><\/script>\s*/gi
];

function stripBlock(s, start, end) {
  const a = s.indexOf(start), b = s.indexOf(end);
  if (a === -1 || b === -1) return s;
  return s.slice(0, a) + s.slice(b + end.length).replace(/^\s*\n/, "");
}

export function transform(html, dest) {
  let s = html;
  // ----- head -----
  s = stripBlock(s, HEAD_START, HEAD_END);
  s = stripBlock(s, "<!--rf:shell-->", "<!--/rf:shell-->");
  const descMatch = s.match(/<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i);
  const existingDescription = descMatch ? descMatch[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : "";
  s = s.replace(/<meta\s+name="description"[^>]*>\s*/gi, "");
  s = s.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  for (const re of LEGACY_HEAD) s = s.replace(re, "");
  const viewport = s.match(/<meta\s+name="viewport"[^>]*>/i);
  if (!viewport) throw new Error(dest.file + ": missing viewport meta");
  s = s.replace(viewport[0], viewport[0] + "\n" + buildHeadBlock(dest, existingDescription));
  s = s.replace(/<\/head>/i, HEAD_TAIL + "\n</head>");
  // ----- chrome -----
  s = stripBlock(s, CHROME_START, CHROME_END);
  s = s.replace(/<header class="top">[\s\S]*?<\/header>\s*/i, "");
  s = s.replace(/<header class="topbar">[\s\S]*?<\/header>\s*/i, "");
  s = s.replace(/<aside class="sidebar">[\s\S]*?<\/aside>\s*/i, "");
  const body = s.match(/<body([^>]*)>/i);
  if (!body) throw new Error(dest.file + ": missing <body>");
  let attrs = body[1];
  if (/class="/i.test(attrs)) attrs = attrs.replace(/class="([^"]*)"/i, (m, c) => /\brf-page\b/.test(c) ? m : `class="${c} rf-page"`);
  else attrs = attrs + ' class="rf-page"';
  s = s.replace(body[0], `<body${attrs}>\n${buildChrome(dest.file)}`);
  // ----- main landmark -----
  s = s.replace(/<main([^>]*)>/i, (m, a) => {
    let attrs2 = a.replace(/\s+id="[^"]*"/i, "").replace(/\s+tabindex="[^"]*"/i, "");
    return `<main id="rf-main" tabindex="-1"${attrs2}>`;
  });
  return s;
}

export function run(check) {
  const bad = [];
  for (const dest of DESTINATIONS) {
    const p = path.join(root, dest.file);
    const before = fs.readFileSync(p, "utf8");
    const after = transform(before, dest);
    if (after !== before) { bad.push(dest.file); if (!check) fs.writeFileSync(p, after); }
  }
  return bad;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const changed = run(check);
  if (check) {
    if (changed.length) { console.error("Shell out of date in: " + changed.join(", ") + "\nRun: node tools/apply-shell.mjs"); process.exit(1); }
    console.log("Shell is up to date in all " + DESTINATIONS.length + " pages.");
  } else {
    console.log(changed.length ? "Updated: " + changed.join(", ") : "No changes; all pages already match.");
  }
}
