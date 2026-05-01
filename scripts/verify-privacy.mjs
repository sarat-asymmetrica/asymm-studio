#!/usr/bin/env node
/**
 * verify-privacy.mjs
 *
 * Scans all .ts and .svelte files in packages/asymm-bio-resonance/ for patterns
 * that would leak user data outside the browser tab (AGENTS.md Rule 4).
 *
 * Exit 0 — clean.
 * Exit 1 — violations found (file:line details printed to stderr).
 *
 * Exclusions:
 *   - *.test.ts files are skipped entirely (they may assert the ABSENCE of these
 *     patterns and therefore contain them as string literals in negative assertions).
 *   - fetch is allowed inside gpu-bridge.ts (intentional backend transport).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..', 'packages', 'asymm-bio-resonance');

// ---------------------------------------------------------------------------
// Forbidden patterns
// Each entry: { label, regex }
// The regex is tested line-by-line so it only needs to match within one line.
// ---------------------------------------------------------------------------
const FORBIDDEN = [
  {
    label: 'localStorage',
    // Match actual usage: localStorage.getItem / localStorage.setItem / localStorage[...] etc.
    // Excludes comment lines (// ... or * ...) via the leading-space check below.
    regex: /\blocalStorage\s*[.[]/,
  },
  {
    label: 'sessionStorage',
    regex: /\bsessionStorage\s*[.[]/,
  },
  {
    label: 'IndexedDB (indexedDB global)',
    regex: /\bindexedDB\b/,
  },
  {
    label: 'IndexedDB (IDBFactory / IDBDatabase)',
    regex: /\bIDB(Factory|Database|ObjectStore|Transaction|Request|Cursor|KeyRange|Index)\b/,
  },
  {
    label: 'navigator.sendBeacon',
    regex: /navigator\s*\.\s*sendBeacon\b/,
  },
  {
    label: 'tracking pixel (new Image())',
    // new Image() followed (optionally with whitespace) by a src assignment is a
    // classic tracking pixel pattern. We flag the construction itself.
    regex: /new\s+Image\s*\(\s*\)/,
  },
  {
    label: 'fetch (outside gpu-bridge.ts)',
    regex: /\bfetch\s*\(/,
    // Applied only to files where isFetchAllowed() returns false (see below).
    fetchGuarded: true,
  },
];

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

/**
 * Recursively yield every .ts / .svelte file under `dir`, skipping node_modules.
 */
function* collectFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      yield* collectFiles(full);
    } else {
      const ext = extname(entry);
      if (ext === '.ts' || ext === '.svelte') {
        yield full;
      }
    }
  }
}

/** Returns true for test files that should be skipped wholesale. */
function isTestFile(filePath) {
  return basename(filePath).endsWith('.test.ts');
}

/** Returns true for the one file where fetch is intentionally used. */
function isFetchAllowed(filePath) {
  return basename(filePath) === 'gpu-bridge.ts';
}

// ---------------------------------------------------------------------------
// Scanning
// ---------------------------------------------------------------------------

const violations = [];

for (const filePath of collectFiles(ROOT)) {
  if (isTestFile(filePath)) continue;

  const rel = relative(join(__dirname, '..'), filePath).replace(/\\/g, '/');
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const fetchAllowed = isFetchAllowed(filePath);

  lines.forEach((line, idx) => {
    // Strip leading whitespace + comment prefixes before checking so that
    // documentation comments that *mention* localStorage don't trigger.
    const stripped = line.trimStart();
    const isComment =
      stripped.startsWith('//') ||
      stripped.startsWith('*') ||
      stripped.startsWith('/*') ||
      stripped.startsWith('#');
    if (isComment) return;

    for (const pattern of FORBIDDEN) {
      if (pattern.fetchGuarded && fetchAllowed) continue;
      if (pattern.regex.test(line)) {
        violations.push({ file: rel, line: idx + 1, col: line.search(pattern.regex) + 1, label: pattern.label, text: line.trim() });
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (violations.length === 0) {
  console.log('verify-privacy: PASS — no data-leak patterns found.');
  process.exit(0);
} else {
  console.error(`verify-privacy: FAIL — ${violations.length} violation(s) found.\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}:${v.col}  [${v.label}]`);
    console.error(`    > ${v.text}`);
  }
  console.error('');
  console.error('AGENTS.md Rule 4: Camera frames and presence data must NEVER leave the browser tab.');
  console.error('Fix all violations above before merging.');
  process.exit(1);
}
