import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const core = fs.readFileSync(path.join(root, "personality-core.js"), "utf8");
const kb = JSON.parse(fs.readFileSync(path.join(root, "personality-knowledge-base.json"), "utf8"));
new Function(core);
assert.equal(kb.schemaVersion, "1.0.0");
assert.equal(kb.models.length, 3);
assert.deepEqual(new Set(kb.models.map(x => x.id)), new Set(["big-five", "mbti", "disc"]));
const sourceIds = new Set(kb.sources.map(s => s.id));
for (const model of kb.models) {
  assert.ok(model.methods.length > 50, model.id + " must document method and limits");
  assert.ok(model.gaps.length >= 2, model.id + " must declare unresolved validation gaps");
}
for (const src of kb.sources) {
  assert.ok(src.url.startsWith("https://"), "Source must be an HTTPS URL");
  assert.ok(src.title && src.type && src.supports && src.limits, "Source provenance must be complete: " + src.id);
  for (const id of src.modelIds) assert.ok(kb.models.some(m => m.id === id), "Unknown model on source " + src.id);
}
for (const id of ["ipip", "bfi2-main", "bfi2-short", "mbti-official", "mbti-ethics", "disc-science"]) assert.ok(sourceIds.has(id), "Missing key reference " + id);
for (const [file, kind, title] of [
  ["big-five-studio.html", "big-five", "Big Five Studio"],
  ["mbti-studio.html", "mbti", "MBTI Studio"],
  ["disc-studio.html", "disc", "DISC Studio"]
]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  assert.ok(html.includes('data-kind="' + kind + '"'), file + " must select correct scoring model");
  assert.ok(html.includes(title), file + " must have a title");
  assert.ok(html.includes('src="personality-core.js"'), file + " must use shared engine");
}
for (const phrase of ["Research, method & provenance", "Evidence boundary", "not population percentiles", "low-confidence", "ipsative"]) {
  assert.ok(core.includes(phrase), "Missing uncertainty / provenance control: " + phrase);
}
assert.ok(core.includes("target=\"_blank\" rel=\"noopener noreferrer\""), "External research links must be safe");
console.log("Personality studio integrity checks passed.");
