// Behavioural checks for the OPS Research Lab. Unlike ops-studio-check.mjs (structure/syntax),
// this runs the page's real logic in a stubbed browser context and tests the numbers it produces.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "ops-studio.html"), "utf8");
const kb = JSON.parse(fs.readFileSync(path.join(root, "ops-knowledge-base.json"), "utf8"));
const script = html.match(/<script>([\s\S]*?)<\/script>/i)[1];

const stub = new Proxy(function () {}, {
  get: (_t, k) => (k === Symbol.toPrimitive ? () => "" : k === "classList" ? { toggle() {}, add() {}, remove() {} } : stub),
  apply: () => stub, set: () => true
});
const win = { __OPS_TEST_HOOK__: {} };
vm.runInNewContext(script, {
  window: win, console, URL, setTimeout, Blob: function () {}, DOMParser: function () {},
  document: { getElementById: () => stub, querySelectorAll: () => [], createElement: () => stub, body: stub, head: stub },
  localStorage: { getItem: () => null, setItem() {} }, location: { hash: "" }, history: { replaceState() {} },
  navigator: {}, fetch: () => Promise.reject(new Error("offline")), alert() {}, prompt() {}, confirm: () => false
});
const A = win.__OPS_TEST_HOOK__.api;
assert.ok(A, "test hook API must be exposed by ops-studio.html");
A.setKB(kb);

let passed = 0;
const test = (name, fn) => { fn(); passed++; };

// ---- 1. Type space: the workbench rules and the enumerator are the same rules ----
test("enumeration is exactly 512 unique configurations", () => {
  const e = A.enumerateClassicSpace();
  assert.equal(e.total, 512); assert.equal(e.unique, 512); assert.equal(e.pairCount, 32);
});
test("every enumerated configuration passes every required workbench check", () => {
  for (const c of A.enumerateClassicSpace().configs)
    assert.ok(A.structureChecks(c.first, c.second, c.stack).required.every(x => x.ok), JSON.stringify(c));
});
test("documented example codes are accepted", () => {
  for (const code of ["FF – Fe/Se – PC/S(B)", "MF – Ni/Fi – SB/P(C)"]) assert.ok(A.parseOpsLabel(code), code);
});
test("structurally invalid codes are rejected", () => {
  assert.equal(A.parseOpsLabel("MF-Te/Ti-BP/S(C)"), null, "same-axis functions");
  assert.equal(A.parseOpsLabel("MF-Te/Ni-PP/S(C)"), null, "repeated animal");
  assert.equal(A.parseOpsLabel("MF-Te/Ni-SB/P(C)"), null, "lead animal must be B for Te/Ni");
  assert.equal(A.parseOpsLabel("MF-Zz/Ni-BP/S(C)"), null, "unknown function");
  assert.ok(A.parseOpsLabel("MF-Te/Ni-BPSC"), "compact stack form is accepted");
});
test("the advisory second-animal rule would contradict the 512 total", () => {
  const e = A.enumerateClassicSpace();
  assert.equal(e.advisoryPassCount, 256, "documented in OPS-RESEARCH.md; update the doc if this changes");
});

// ---- 2. Lexical signal analysis ----
test("negation is detected within a clause and not across sentences", () => {
  const ne = t => A.analyzeSignals(t).results.find(r => r.id === "Ne");
  const a = ne("I do not like to brainstorm ideas with anyone at work.");
  assert.equal(a.counter, 1); assert.equal(a.support, 0);
  const b = ne("I never nap. What if we tried it together today?");
  assert.equal(b.support, 1); assert.equal(b.counter, 0);
  const c = ne("I love to brainstorm and I really enjoy possibilities.");
  assert.equal(c.support, 2); assert.equal(c.counter, 0);
  const d = ne("She doesn't really brainstorm much.");
  assert.equal(d.counter, 1);
});
test("a phrase inside a longer phrase is not double counted", () => {
  const r = A.analyzeSignals("I always think about what others need before I decide.").results;
  assert.equal(r.find(x => x.id === "De").support, 1);
  assert.equal(r.find(x => x.id === "Fe").support, 0);
});
test("counts are not capped by the excerpt limit", () => {
  const r = A.analyzeSignals("brainstorm ".repeat(40)).results.find(x => x.id === "Ne");
  assert.equal(r.support, 40); assert.ok(r.hits.length <= 12);
});
test("rate is per 1,000 words", () => {
  const r = A.analyzeSignals(("brainstorm " + "word ".repeat(99)).repeat(2)).results.find(x => x.id === "Ne");
  assert.equal(r.rate, 10);
});
test("dictionary terms are unique across groups and regex-safe", () => {
  const seen = new Map();
  for (const g of A.signalGroups) for (const t of g.terms) {
    assert.ok(!seen.has(t.toLowerCase()), "term appears in two groups: " + t + " (" + seen.get(t.toLowerCase()) + ", " + g.id + ")");
    seen.set(t.toLowerCase(), g.id);
    assert.doesNotThrow(() => A.analyzeSignals("probe " + t));
  }
});

// ---- 3. Retrieval maths ----
test("TF-IDF cosine behaves like a similarity", () => {
  const rows = [{ text: "alpha beta gamma delta" }, { text: "omega sigma kappa lambda" }, { text: "alpha omega beta sigma" }];
  const { idf } = A.buildOpsIdf(rows), v = rows.map(r => A.opsVector(r.text, idf));
  assert.ok(Math.abs(A.opsCosine(v[0], v[0]) - 1) < 1e-9);
  assert.equal(A.opsCosine(v[0], v[1]), 0);
  assert.ok(Math.abs(A.opsCosine(v[0], v[2]) - A.opsCosine(v[2], v[0])) < 1e-12);
  assert.ok(A.opsCosine(v[0], v[2]) > 0 && A.opsCosine(v[0], v[2]) < 1);
});
test("CSV parser handles quotes, embedded commas, newlines and BOM", () => {
  const rows = A.csvRows('﻿text,type\n"a, b ""q""\nline2",MF-Te/Ni-BP/S(C)\r\nplain,x\n');
  assert.equal(rows.length, 2); assert.equal(rows[0].text, 'a, b "q"\nline2'); assert.equal(rows[1].type, "x");
});
test("a generic row id is not treated as a person/group key", () => {
  const r = A.normalizeOpsRow({ text: "x".repeat(40), type: "MF-Te/Ni-BP/S(C)", id: "7" }, 3);
  assert.ok(r.groupId.startsWith("ungrouped-"));
});

// ---- 4. Held-out evaluation ----
const codes = A.enumerateClassicSpace().configs.filter((_, i) => i % 61 === 0).slice(0, 6).map(c =>
  `${c.modality}-${c.first}/${c.second}-${c.stack.slice(0, 2)}/${c.stack[2]}(${c.stack[3]})`);
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
function makeRows(groupCount, shuffleLabels) {
  const rows = [];
  for (let g = 0; g < groupCount; g++) {
    const ti = g % codes.length;
    for (let k = 0; k < 4; k++) {
      const noise = Array.from({ length: 12 }, () => "w" + Math.floor(rnd() * 4000)).join(" ");
      rows.push({ id: `r${g}-${k}`, groupId: "person-" + g, text: `type${ti}word one type${ti}word two type${ti}word three ${noise}`,
        opsType: codes[ti], synthetic: false });
    }
  }
  if (shuffleLabels) { const labels = rows.map(r => r.opsType); for (let i = labels.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [labels[i], labels[j]] = [labels[j], labels[i]]; } rows.forEach((r, i) => r.opsType = labels[i]); }
  return rows;
}
test("evaluation is deterministic and keeps groups on one side of the split", () => {
  const a = A.evaluateOpsRows(makeRows(40)), b = A.evaluateOpsRows(makeRows(40));
  assert.ok(!a.error, a.error);
  assert.deepEqual(a.splitGroups, b.splitGroups);
  const train = new Set(a.splitGroups.train);
  assert.ok(a.splitGroups.test.length > 0 && a.splitGroups.test.every(g => !train.has(g)), "group leaked across split");
});
test("learnable labels score high and shuffled labels do not", () => {
  const real = A.evaluateOpsRows(makeRows(60)), control = A.evaluateOpsRows(makeRows(60, true));
  const get = (r, n) => r.metrics.find(m => m.name === n);
  assert.ok(get(real, "leadFunction").accuracyAll > 0.9, "real signal should be recovered");
  assert.ok(get(control, "leadFunction").accuracyAll < get(real, "leadFunction").accuracyAll - 0.3, "shuffled-label control must score far lower");
});
test("abstentions are counted as errors in headline accuracy", () => {
  const rows = makeRows(40);
  for (let i = 0; i < 10; i++) rows.push({ id: "odd" + i, groupId: "person-" + (30 + (i % 10)), text: "zzqx" + i + " completely unrelated vocabulary here " + "qq" + i, opsType: codes[0], synthetic: false });
  const r = A.evaluateOpsRows(rows, { minSim: 0.6 });
  assert.ok(!r.error, r.error);
  const m = r.metrics[0];
  assert.ok(m.coverage <= 1);
  assert.ok(m.accuracyAll <= m.accuracyAnswered + 1e-12);
  if (r.abstained > 0) assert.ok(m.accuracyAll < m.accuracyAnswered || m.accuracyAnswered === 0);
});
test("near-duplicates of training rows are removed from the test set", () => {
  const rows = makeRows(40);
  const train = A.evaluateOpsRows(rows).splitGroups.train;
  const donor = rows.find(r => r.groupId === train[0]);
  const testG = A.evaluateOpsRows(rows).splitGroups.test[0];
  rows.push({ id: "dup", groupId: testG, text: donor.text, opsType: donor.opsType, synthetic: false });
  assert.ok(A.evaluateOpsRows(rows).leaked >= 1);
});
test("too few groups, ungrouped rows and invalid labels are refused or excluded", () => {
  assert.ok(A.evaluateOpsRows(makeRows(6)).error);
  const rows = makeRows(30); rows.push({ id: "u", groupId: "ungrouped-1", text: "u".repeat(30), opsType: codes[0], synthetic: false },
    { id: "bad", groupId: "person-1", text: "b".repeat(30), opsType: "MF-Te/Ti-BP/S(C)", synthetic: false });
  const r = A.evaluateOpsRows(rows);
  assert.equal(r.ungrouped, 1); assert.equal(r.unparseable, 1);
});
test("synthetic rows never reach evaluation", () => {
  const rows = makeRows(30).map(r => ({ ...r, synthetic: true }));
  assert.ok(A.evaluateOpsRows(rows).error);
});

console.log(`OPS logic checks passed: ${passed} groups`);
