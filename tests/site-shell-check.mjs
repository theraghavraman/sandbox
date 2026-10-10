// Guards UI consistency across the whole sandbox: every page must use the one shared shell.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
import { root, DESTINATIONS, SITE, run, buildChrome } from "../tools/apply-shell.mjs";

// 1. Generated chrome/head are exactly what tools/apply-shell.mjs produces (no hand edits, no drift).
assert.deepEqual(run(true), [], "Pages differ from the generator output. Run: node tools/apply-shell.mjs");

// 2. Every page in the repo root is a registered destination, and every destination exists.
const pages = fs.readdirSync(root).filter(f => f.endsWith(".html")).sort();
const registered = DESTINATIONS.map(d => d.file).sort();
assert.deepEqual(pages, registered, "HTML pages and DESTINATIONS in tools/apply-shell.mjs must match (add new pages to the registry)");
assert.equal(new Set(registered).size, registered.length, "Duplicate destination");

const navSignature = html => [...html.matchAll(/<a class="rf-link[^"]*" href="([^"]+)"[^>]*>(?:<span[^>]*>[^<]*<\/span>)?([^<]+)<\/a>/g)].map(m => m[1] + "|" + m[2]);
const expectedNav = DESTINATIONS.map(d => d.file + "|" + d.label.replace(/&/g, "&amp;")).sort();
const legacy = [/class="topbar"/, /class="sidebar"/, /class="nav-extra/, /class="nav-item/, /<header class="top">/, /class="shell"/, /<aside class="side"/];

for (const dest of DESTINATIONS) {
  const html = fs.readFileSync(path.join(root, dest.file), "utf8");
  const where = dest.file + ": ";
  // head
  assert.ok(html.includes(`<title>${dest.title.replace(/&/g, "&amp;")} · ${SITE}</title>`), where + "title must be '<page> · " + SITE + "'");
  for (const needle of ['rel="icon"', "fonts.googleapis.com/css2?family=Bricolage+Grotesque", 'href="redmark-revamp.css', 'href="sandbox-shell.css', 'src="sandbox-shell.js', 'name="viewport"', 'name="description"', 'name="theme-color"'])
    assert.ok(html.includes(needle), where + "missing " + needle);
  assert.ok(html.indexOf('href="sandbox-shell.css') > html.indexOf("</style>") || !html.includes("<style"), where + "shell CSS must load after page CSS so it wins the cascade");
  // body + landmarks
  assert.match(html, /<body[^>]*class="[^"]*\brf-page\b/, where + "body needs class rf-page");
  assert.equal((html.match(/<main\b/g) || []).length, 1, where + "exactly one <main>");
  assert.ok(html.includes('<main id="rf-main" tabindex="-1"'), where + "main must be the skip-link target");
  assert.equal((html.match(/class="rf-topbar"/g) || []).length, 1, where + "exactly one topbar");
  assert.equal((html.match(/class="rf-side"/g) || []).length, 1, where + "exactly one sidebar");
  assert.ok(html.includes('class="rf-skip"'), where + "skip link");
  for (const re of legacy) assert.ok(!re.test(html), where + "legacy chrome still present: " + re);
  // navigation: same 20 destinations in the same order on every page, exactly one active = this page
  const chrome = html.slice(html.indexOf("<!--rf:chrome-->"), html.indexOf("<!--/rf:chrome-->") + "<!--/rf:chrome-->".length);
  assert.equal(chrome, buildChrome(dest.file), where + "chrome must equal generator output");
  assert.deepEqual(navSignature(chrome).sort(), expectedNav, where + "nav must list all destinations");
  assert.deepEqual(navSignature(chrome), DESTINATIONS.map(d => d.file + "|" + d.label.replace(/&/g, "&amp;")), where + "nav order must match the registry (grouped)".replace("(grouped)", ""));
  const active = [...chrome.matchAll(/class="rf-link is-active" href="([^"]+)" aria-current="page"/g)].map(m => m[1]);
  assert.deepEqual(active, [dest.file], where + "exactly this page must be active");
  // unique ids so the skip link and drawer cannot collide with page ids
  for (const id of ["rf-main", "rf-side"]) assert.equal((html.match(new RegExp('id="' + id + '"', "g")) || []).length, 1, where + "duplicate id " + id);
  // every in-page link to a sandbox page resolves
  for (const m of html.matchAll(/href="\.?\/?([a-z0-9-]+\.html)(?:#[^"]*)?"/g)) assert.ok(pages.includes(m[1]), where + "broken link to " + m[1]);
}

// 3. Shared assets exist and are valid.
for (const f of ["sandbox-shell.css", "sandbox-shell.js", "redmark-revamp.css", "favicon.svg", "personality-studio.css"]) assert.ok(fs.existsSync(path.join(root, f)), "Missing shared asset " + f);
new vm.Script(fs.readFileSync(path.join(root, "sandbox-shell.js"), "utf8"));
const shellCss = fs.readFileSync(path.join(root, "sandbox-shell.css"), "utf8");
assert.equal((shellCss.match(/{/g) || []).length, (shellCss.match(/}/g) || []).length, "sandbox-shell.css braces must balance");
assert.ok(/@media \(max-width: 900px\)/.test(shellCss) && /rf-nav-open/.test(shellCss), "mobile drawer styles required");

// 4. Docs state the right count.
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.ok(readme.includes(DESTINATIONS.length + " independent destinations") || readme.includes(DESTINATIONS.length + " destinations"), "README destination count is out of date");

console.log("Site shell checks passed:", { pages: pages.length, destinations: DESTINATIONS.length });
