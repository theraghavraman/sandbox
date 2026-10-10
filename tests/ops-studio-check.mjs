import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const html = fs.readFileSync(path.join(root, "ops-studio.html"), "utf8");
const kb = JSON.parse(fs.readFileSync(path.join(root, "ops-knowledge-base.json"), "utf8"));
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(scriptMatch, "OPS studio must contain its application script");
new Function(scriptMatch[1]); // Parse only; do not execute browser code in Node.

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, "HTML IDs must be unique");
const scriptIds = [...scriptMatch[1].matchAll(/\$\("([^"]+)"\)/g)].map(m => m[1]);
for (const id of scriptIds) assert.ok(ids.includes(id), "Missing HTML element referenced by script: " + id);

assert.equal(kb.schemaVersion, "1.0.0");
assert.equal(kb.models.find(m => m.id === "classic-512")?.count, 512);
assert.equal(kb.models.find(m => m.id === "expanded-2048")?.count, 2048);
assert.equal(kb.coins.filter(c => c.model === "classic-512" && c.independent).length, 9,
  "Classic model should have nine independent coins");
assert.equal(kb.coins.find(c => c.id === "derived-info-energy")?.independent, false,
  "Info/Energy must remain a derived distinction, not an extra independent coin");

const sourceIds = new Set(kb.sources.map(s => s.id));
for (const group of ["dimensions", "coins", "functions", "animals", "rules", "glossary", "models"]) {
  for (const item of kb[group] ?? []) {
    for (const sourceId of item.sourceIds ?? []) {
      assert.ok(sourceIds.has(sourceId), "Dangling source reference: " + sourceId + " on " + (item.id || item.name));
    }
  }
}
assert.equal(kb.functions.length, 8);
assert.equal(kb.animals.length, 4);
assert.equal(kb.validAnimalStacks.length, 16, "Classic stack set must contain the 16 stacks in the cited community guide");
assert.equal(new Set(kb.validAnimalStacks).size, 16, "Animal stacks must be unique");
for (const stack of kb.validAnimalStacks) {
  assert.equal(stack.length, 4, "Every animal stack must have four symbols: " + stack);
  assert.equal(new Set(stack).size, 4, "Every stack must use each animal once: " + stack);
  for (const animal of ["P", "S", "B", "C"]) assert.ok(stack.includes(animal), "Stack missing " + animal + ": " + stack);
  const firstIsEnergy = ["P", "S"].includes(stack[0]);
  const secondIsEnergy = ["P", "S"].includes(stack[1]);
  assert.notEqual(firstIsEnergy, secondIsEnergy, "First two savior animals must be one energy and one information animal: " + stack);
}
assert.ok(html.includes('id="pane-coverage"'), "Coverage report UI must be present");
assert.ok(html.includes("runExhaustive"), "Exhaustive type-space checker must be present");
const animalFor = {"De|Oe":"P","Di|Oi":"S","De|Oi":"B","Di|Oe":"C"};
const compatiblePairs = [];
for (const first of kb.functions) for (const second of kb.functions) {
  if (first.axis === second.axis || first.id === second.id) continue;
  const components = [...first.components, ...second.components];
  const d = components.find(x => x === "Di" || x === "De");
  const o = components.find(x => x === "Oi" || x === "Oe");
  const lead = animalFor[d + "|" + o];
  const stacks = kb.validAnimalStacks.filter(stack => stack[0] === lead);
  if (lead && stacks.length === 4) compatiblePairs.push({ first: first.id, second: second.id, stacks });
}
assert.equal(compatiblePairs.length, 32, "Expected 32 ordered savior-function pairs");
assert.ok(compatiblePairs.every(pair => pair.stacks.length === 4), "Each ordered function pair should have four compatible stacks");
const enumeratedCount = compatiblePairs.reduce((sum, pair) => sum + pair.stacks.length * 4, 0);
assert.equal(enumeratedCount, 512, "Classic code convention should enumerate 512 configurations");
assert.ok(html.includes('href="ops-studio.html"') || html.includes("OPS Research Lab"));
const codePattern = /^([MF]{2})\s*[–-]\s*([A-Z][a-z])\s*\/\s*([A-Z][a-z])\s*[–-]\s*([PSBC]{2})\s*\/\s*([PSBC])\s*\(\s*([PSBC])\s*\)$/;
for (const code of ["FF – Fe/Se – PC/S(B)", "MF – Ni/Fi – SB/P(C)"]) {
  assert.ok(codePattern.test(code), "Expected common type-code example to parse: " + code);
}
console.log("OPS Studio checks passed:", {
  sources: kb.sources.length,
  concepts: kb.dimensions.length + kb.coins.length + kb.functions.length + kb.animals.length + kb.rules.length + kb.glossary.length + kb.models.length,
  classicIndependentCoins: 9,
  validAnimalStacks: kb.validAnimalStacks.length,
  orderedFunctionPairs: compatiblePairs.length,
  enumeratedClassicConfigurations: enumeratedCount,
  htmlIds: ids.length
});
