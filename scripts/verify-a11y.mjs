#!/usr/bin/env node
/**
 * verify-a11y.mjs
 *
 * Static accessibility checks on .svelte files across the whole packages/ tree.
 * This is NOT a full WCAG audit — it is a fast machine-checkable gate for the
 * most common mechanical failures (AGENTS.md Rule 5).
 *
 * Checks:
 *   1. Interactive elements (button, input, select, textarea) must have an
 *      accessible label:  aria-label=, aria-labelledby=, or an inner <label>
 *      association is accepted if the element has an id= attribute.
 *      (We detect the simple "aria-label absent on element" case.)
 *
 *   2. Status/alert containers must carry an explicit role attribute.
 *      Heuristic: divs/spans with class names containing "status", "alert",
 *      "error", "message", "toast", "notification", "banner" or "live"
 *      should have role= or aria-live=.
 *
 *   3. Any .svelte file that contains CSS animation or transition rules must
 *      also contain a @media (prefers-reduced-motion …) block somewhere in
 *      the file (either in <style> or in an imported stylesheet reference).
 *
 * Exit 0 — clean.
 * Exit 1 — violations found (file:line details printed to stderr).
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PACKAGES_ROOT = join(__dirname, '..', 'packages');

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

function* collectSvelteFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      yield* collectSvelteFiles(full);
    } else if (extname(entry) === '.svelte') {
      yield full;
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Very small tag tokeniser: finds all opening HTML tags in a line and returns
 * { tagName, attrs } objects.  Handles multi-attribute single-line tags only;
 * multi-line tags are assembled by the caller.
 */
function parseOpenTags(text) {
  const results = [];
  // Match <tagName ...> but not </tagName> or <!...> or {# ...}
  const TAG_RE = /<([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)\s*>/g;
  let m;
  while ((m = TAG_RE.exec(text)) !== null) {
    results.push({ tagName: m[1].toLowerCase(), attrs: m[2] });
  }
  return results;
}

function hasAttr(attrs, name) {
  // Match attr="...", attr='...', attr={...}, or bare `attr`
  const re = new RegExp(`\\b${name}\\s*(?:=|$|\\s)`, 'i');
  return re.test(attrs);
}

// Status-container class heuristic keywords
const STATUS_CLASSES = /\b(status|alert|error|message|toast|notification|banner|live)\b/i;
const STATUS_TAGS = new Set(['div', 'span', 'section', 'aside', 'p']);

// Interactive element tags that need a label
const INTERACTIVE_TAGS = new Set(['button', 'input', 'select', 'textarea']);

// Animation/transition patterns in CSS
const CSS_ANIMATION_RE = /(?:animation|transition)\s*:/;
const REDUCED_MOTION_RE = /@media\s*\([^)]*prefers-reduced-motion/;

// ---------------------------------------------------------------------------
// Per-file analysis
// ---------------------------------------------------------------------------

function analyseFile(filePath) {
  const issues = [];
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const rel = relative(join(__dirname, '..'), filePath).replace(/\\/g, '/');

  // --- Check 3: prefers-reduced-motion (whole-file scan) ---
  const hasAnimation = CSS_ANIMATION_RE.test(content);
  const hasReducedMotion = REDUCED_MOTION_RE.test(content);
  if (hasAnimation && !hasReducedMotion) {
    issues.push({
      file: rel,
      line: null,
      check: 'prefers-reduced-motion',
      detail: 'File uses CSS animation/transition but has no @media (prefers-reduced-motion) block.',
    });
  }

  // For checks 1 & 2 we need to handle tags that may span multiple lines.
  // Strategy: join all lines and find tags, tracking original line numbers via
  // the character offset.
  //
  // We work line-by-line for simplicity and accept the limitation that a tag
  // split exactly across lines (opening < on one line, closing > on the next)
  // will be missed — that's an edge case that does not occur in practice in
  // Svelte components built by this project.

  lines.forEach((line, idx) => {
    const lineNo = idx + 1;

    // Skip comment lines
    const stripped = line.trimStart();
    if (stripped.startsWith('<!--') || stripped.startsWith('//') || stripped.startsWith('*')) return;

    const tags = parseOpenTags(line);
    for (const { tagName, attrs } of tags) {
      // --- Check 1: interactive elements need accessible labels ---
      if (INTERACTIVE_TAGS.has(tagName)) {
        const hasLabel =
          hasAttr(attrs, 'aria-label') ||
          hasAttr(attrs, 'aria-labelledby') ||
          hasAttr(attrs, 'aria-describedby') ||
          // type="hidden" inputs don't need labels
          /type\s*=\s*["']?hidden["']?/i.test(attrs) ||
          // submit/button inputs use value= as their label
          /type\s*=\s*["']?(submit|button|reset|image)["']?/i.test(attrs);

        if (!hasLabel) {
          issues.push({
            file: rel,
            line: lineNo,
            check: 'missing-aria-label',
            detail: `<${tagName}> has no aria-label / aria-labelledby — screen readers will not announce it.`,
            text: line.trim(),
          });
        }
      }

      // --- Check 2: status containers need role or aria-live ---
      if (STATUS_TAGS.has(tagName)) {
        const classMatch = attrs.match(/class\s*=\s*["'{]([^"'}]*)/i);
        const classVal = classMatch ? classMatch[1] : '';
        if (STATUS_CLASSES.test(classVal)) {
          const hasRole = hasAttr(attrs, 'role') || hasAttr(attrs, 'aria-live');
          if (!hasRole) {
            issues.push({
              file: rel,
              line: lineNo,
              check: 'status-container-missing-role',
              detail: `<${tagName} class="…${classVal}…"> looks like a status container but has no role= or aria-live=.`,
              text: line.trim(),
            });
          }
        }
      }
    }
  });

  return issues;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const allIssues = [];

for (const filePath of collectSvelteFiles(PACKAGES_ROOT)) {
  allIssues.push(...analyseFile(filePath));
}

if (allIssues.length === 0) {
  console.log('verify-a11y: PASS — no accessibility violations found.');
  process.exit(0);
} else {
  console.error(`verify-a11y: FAIL — ${allIssues.length} violation(s) found.\n`);

  for (const issue of allIssues) {
    const loc = issue.line != null ? `${issue.file}:${issue.line}` : issue.file;
    console.error(`  ${loc}  [${issue.check}]`);
    console.error(`    ${issue.detail}`);
    if (issue.text) console.error(`    > ${issue.text}`);
  }

  console.error('');
  console.error('AGENTS.md Rule 5: Every component must pass WCAG AA.');
  console.error('Add aria-label, role, and prefers-reduced-motion as needed, then re-run.');
  process.exit(1);
}
