// Deck validation: schema, unique ids, output fidelity against the ziglings key.
import fs from "node:fs";
import path from "node:path";

const decksDir = new URL("../decks/", import.meta.url);

// ziglings sources are not vendored; point at a checkout via env (CI clones it).
// The expected-output answer key IS vendored (scripts/data/ziglings-outputs.json).
const ZIGLINGS_DIR = process.env.ZIGLINGS_DIR ?? path.resolve("../ziglings");
const ZIGLINGS_HEALED = process.env.ZIGLINGS_HEALED ?? "/tmp/healed";
const SKIP_SOURCES = process.argv.includes("--skip-sources");

const deckFiles = fs
  .readdirSync(decksDir)
  .filter((f) => f.endsWith(".ts"))
  .sort();

const decks = [];
for (const f of deckFiles) {
  const mod = await import(path.join(decksDir.pathname, f));
  decks.push(mod.default);
}

const key = JSON.parse(
  fs.readFileSync(new URL("./data/ziglings-outputs.json", import.meta.url), "utf8"),
);
const keyByFile = new Map(key.map((e) => [e.file, e.output]));

const exercisesDir = path.join(ZIGLINGS_DIR, "exercises");
const sourcesAvailable = fs.existsSync(exercisesDir);

let errors = [];
const warnings = [];
const ids = new Set();
const types = new Set(["output", "fix", "concept"]);
let cardCount = 0;

const norm = (s) => (s || "").replace(/`/g, "").replace(/\s+/g, " ").trim().toLowerCase();

// Every code line in a card must exist (verbatim, modulo whitespace/comments)
// somewhere in the exercise's broken or healed source. Allows legitimate
// trims and top-level reordering while catching altered/invented code.
function lineSet(text) {
  const set = new Set();
  for (const raw of text.split("\n")) {
    const line = raw
      .replace(/\/\/[^\n]*/, "")
      .replace(/\s+/g, "")
      .trim();
    if (line) set.add(line);
  }
  return set;
}

const sourceCache = {};
function sourceText(file) {
  if (!(file in sourceCache)) {
    const broken = path.join(ZIGLINGS_DIR, "exercises", file);
    const healed = path.join(ZIGLINGS_HEALED, file);
    let t = "";
    if (fs.existsSync(broken)) t += fs.readFileSync(broken, "utf8");
    if (fs.existsSync(healed)) t += "\n" + fs.readFileSync(healed, "utf8");
    sourceCache[file] = t;
  }
  return sourceCache[file];
}

function hasSource(file) {
  return fs.existsSync(path.join(ZIGLINGS_DIR, "exercises", file));
}

for (const deck of decks) {
  if (!deck.id || !/^[a-z0-9-]+$/.test(deck.id)) errors.push(`${deck.id}: bad deck id`);
  if (typeof deck.order !== "number") errors.push(`${deck.id}: missing numeric order`);
  if (!["prerequisites", "zig", "urdu"].includes(deck.section))
    errors.push(`${deck.id}: missing or invalid section '${deck.section}'`);
  if (deck.language != null && !["zig"].includes(deck.language))
    errors.push(`${deck.id}: invalid language '${deck.language}'`);
  if (!Array.isArray(deck.cards) || deck.cards.length === 0) errors.push(`${deck.id}: no cards`);
  const isPrereq = deck.section === "prerequisites";
  const isUrdu = deck.section === "urdu";
  const idsSeen = new Set();
  for (const c of deck.cards) {
    cardCount++;
    for (const f of ["id", "source", "type", "front", "back"]) {
      if (typeof c[f] !== "string" || !c[f].trim())
        errors.push(`${deck.id}/${c.id}: missing '${f}'`);
    }
    if (!types.has(c.type)) errors.push(`${deck.id}/${c.id}: bad type '${c.type}'`);
    if (ids.has(c.id)) errors.push(`duplicate card id '${c.id}'`);
    if (idsSeen.has(c.id)) errors.push(`${deck.id}: duplicate id '${c.id}' within deck`);
    ids.add(c.id);
    idsSeen.add(c.id);

    if (isPrereq) {
      if (!(c.source || "").startsWith("prereq "))
        errors.push(`${deck.id}/${c.id}: prereq source must start with 'prereq '`);
      if (c.type !== "concept")
        errors.push(`${deck.id}/${c.id}: prereq cards must be 'concept' (got '${c.type}')`);
      if (c.code || c.backCode)
        errors.push(`${deck.id}/${c.id}: prereq cards must not carry Zig code`);
      continue;
    }

    if (isUrdu) {
      if (!(c.source || "").startsWith("urdu "))
        errors.push(`${deck.id}/${c.id}: urdu source must start with 'urdu '`);
      if (c.type !== "concept")
        errors.push(`${deck.id}/${c.id}: urdu cards must be 'concept' (got '${c.type}')`);
      if (c.code || c.backCode) errors.push(`${deck.id}/${c.id}: urdu cards must not carry code`);
      continue;
    }

    const m = /^ziglings (\d+)_/.exec(c.source || "");
    if (!m) errors.push(`${deck.id}/${c.id}: bad source '${c.source}'`);
    else {
      const file = `${m[1]}_${c.source.split("_").slice(1).join("_")}.zig`;
      if (!sourcesAvailable) {
        if (SKIP_SOURCES) {
          warnings.push(
            `ziglings sources not found at ${ZIGLINGS_DIR} — skipping source checks (--skip-sources)`,
          );
        } else {
          errors.push(
            `ziglings sources not found at ${ZIGLINGS_DIR} — set ZIGLINGS_DIR/ZIGLINGS_HEALED or run with --skip-sources to skip source-fidelity checks`,
          );
        }
      } else {
        if (!hasSource(file)) {
          errors.push(`${deck.id}/${c.id}: source file not found: ${file}`);
        }
        for (const f of ["code", "backCode"]) {
          if (c[f]) {
            const srcLines = lineSet(sourceText(file));
            const deckLines = lineSet(c[f]);
            const missing = [...deckLines].filter((l) => !srcLines.has(l));
            if (missing.length) {
              errors.push(
                `${deck.id}/${c.id}: '${f}' contains lines not in ${file}: ${missing.slice(0, 4).join(" | ")}`,
              );
            }
          }
        }
      }
      if (c.type === "output") {
        const expected = keyByFile.get(file);
        if (expected !== undefined && expected !== "") {
          const inBack = norm(c.back).includes(norm(expected));
          if (!inBack) {
            errors.push(
              `${deck.id}/${c.id}: output mismatch. expected "${expected}" got back "${c.back}"`,
            );
          }
        } else {
          warnings.push(`${deck.id}/${c.id}: no answer-key output for ${file} (back: "${c.back}")`);
        }
      }
    }
  }
}

console.log(`\nChecked ${decks.length} decks, ${cardCount} cards.`);
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length}):`);
  warnings.forEach((w) => console.log("  - " + w));
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.forEach((e) => console.log("  ✗ " + e));
  process.exit(1);
}
console.log("All checks passed ✓");
