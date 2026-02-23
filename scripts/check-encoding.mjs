#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const stagedOnly = args.has('--staged');

const textExts = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.md',
  '.yml',
  '.yaml',
]);

function getCandidateFiles() {
  if (stagedOnly) {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const out = execSync('git ls-files', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isTextTarget(filePath) {
  return textExts.has(path.extname(filePath).toLowerCase());
}

function hasUtf8Bom(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function hasReplacementChar(buf) {
  return buf.toString('utf8').includes('\uFFFD');
}

function hasSuspiciousMojibake(buf) {
  const text = buf.toString('utf8');
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    // Only inspect lines that contain Hangul.
    if (!/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(line)) continue;

    // Typical mojibake signatures seen when CP949/UTF-8 decoding is mixed.
    if (line.includes('??')) return true;
    if (/\?[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(line)) return true;
    if (/[가-힣ㄱ-ㅎㅏ-ㅣ]\?[^\s]/.test(line)) return true;
    if (/\?[^\s]*\?/.test(line)) return true;
  }

  return false;
}

const files = getCandidateFiles().filter(isTextTarget);
const problems = [];

for (const rel of files) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) continue;
  const buf = fs.readFileSync(abs);

  if (hasUtf8Bom(buf)) {
    problems.push(`${rel}: UTF-8 BOM detected`);
  }
  if (hasReplacementChar(buf)) {
    problems.push(`${rel}: invalid UTF-8 or replacement character detected`);
  }
  if (hasSuspiciousMojibake(buf)) {
    problems.push(`${rel}: suspicious mojibake pattern detected (possible encoding corruption)`);
  }
}

if (problems.length > 0) {
  console.error('[encoding-check] failed');
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}

console.log(`[encoding-check] ok (${files.length} files checked${stagedOnly ? ', staged only' : ''})`);
