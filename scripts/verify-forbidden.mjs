#!/usr/bin/env node
/**
 * verify-forbidden.mjs
 *
 * Scans all .ts and .svelte files in packages/ (and apps/ if present) for
 * patterns explicitly banned by AGENTS.md.
 *
 * Exclusions:
 *   - *.test.ts files (may legitimately assert that forbidden patterns are absent)
 *   - _source_material/ directory (external artefacts, not project code)
 *   - This script itself (scripts/)
 *   - node_modules/
 *
 * Exit 0 — clean.
 * Exit 1 — violations found (file:line details printed to stderr).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Banned patterns (AGENTS.md — Non-Negotiable Rules)
// ---------------------------------------------------------------------------

const BANNED = [
  {
    label: 'console.log',
    // Match console.log( but not console.logger or console.logGroup
    regex: /\bconsole\.log\s*\(/,
    reason: 'Use a proper logger. console.log is stripped in production but wastes review time.',
  },
  {
    label: 'console.debug',
    regex: /\bconsole\.debug\s*\(/,
    reason: 'Use a proper logger. Debug statements must not land in the main branch.',
  },
  {
    label: 'TODO comment',
    // Match // TODO or /* TODO or * TODO — case-insensitive
    regex: /(?:\/\/|\/\*|\*)\s*TODO\b/i,
    reason: 'AGENTS.md Rule 1: No TODOs. Every function must be complete, or create a follow-up ticket.',
  },
  {
    label: 'FIXME comment',
    regex: /(?:\/\/|\/\*|\*)\s*FIXME\b/i,
    reason: 'AGENTS.md Rule 1: No FIXMEs. Fix it now or open a ticket.',
  },
  {
    label: 'TypeScript `as any`',
    // Match `as any` with optional trailing punctuation.  Excludes the word
    // "fantasy" or "canary" — uses word boundary after "any".
    regex: /\bas\s+any\b/,
    reason: 'Use a proper type or unknown + type guard. `as any` bypasses the type system.',
  },
  {
    label: 'wildcard import (import *)',
    // import * as foo from ... — kills tree-shaking and obscures dependencies.
    regex: /\bimport\s*\*\s*as\b/,
    reason: 'Use named imports. Wildcard imports prevent tree-shaking.',
  },
  {
    label: 'eval()',
    regex: /\beval\s*\(/,
    reason: 'eval() is a security hazard and breaks CSP. Never use it.',
  },
  {
    label: 'innerHTML assignment',
    // Catches foo.innerHTML = and foo.innerHTML+= but not innerHTML reading.
    regex: /\.innerHTML\s*[+]?=/,
    reason: 'innerHTML= is an XSS vector. Use textContent= or DOM construction.',
  },
];

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

// Directories that should be skipped entirely regardless of depth.
const SKIP_DIRS = new Set(['node_modules', '_source_material', 'scripts', '.git', 'dist', 'build', '.svelte-kit']);

function* collectFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
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

function isTestFile(filePath) {
  return basename(filePath).endsWith('.test.ts');
}

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

const SCAN_ROOTS = [
  join(REPO_ROOT, 'packages'),
  join(REPO_ROOT, 'apps'),
  join(REPO_ROOT, 'runtime'),
].filter(existsSync);

const violations = [];

for (const root of SCAN_ROOTS) {
  for (const filePath of collectFiles(root)) {
    if (isTestFile(filePath)) continue;

    const rel = relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    const lines = readFileSync(filePath, 'utf8').split('\n');

    lines.forEach((line, idx) => {
      for (const pattern of BANNED) {
        if (pattern.regex.test(line)) {
          violations.push({
            file: rel,
            line: idx + 1,
            col: line.search(pattern.regex) + 1,
            label: pattern.label,
            reason: pattern.reason,
            text: line.trim(),
          });
        }
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (violations.length === 0) {
  console.log('verify-forbidden: PASS — no banned patterns found.');
  process.exit(0);
} else {
  // Group by label for a clean summary
  const byLabel = new Map();
  for (const v of violations) {
    if (!byLabel.has(v.label)) byLabel.set(v.label, []);
    byLabel.get(v.label).push(v);
  }

  console.error(`verify-forbidden: FAIL — ${violations.length} violation(s) across ${byLabel.size} rule(s).\n`);

  for (const [label, vs] of byLabel) {
    console.error(`  Rule: ${label}`);
    console.error(`  Why:  ${vs[0].reason}`);
    for (const v of vs) {
      console.error(`    ${v.file}:${v.line}:${v.col}`);
      console.error(`      > ${v.text}`);
    }
    console.error('');
  }

  console.error('Fix all violations above, then re-run `npm run verify:forbidden`.');
  process.exit(1);
}
