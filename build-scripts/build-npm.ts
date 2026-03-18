#!/usr/bin/env bun

/*
 * SonarQube CLI
 * Copyright (C) 2026 SonarSource Sàrl
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/**
 * Build JS bundle for @pleaseai/sonarqube npm package
 *
 * Usage: bun build-scripts/build-npm.ts
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = dirname(__dirname);

function readVersion(): string {
  if (process.env['PUBLISH_VERSION']) {
    return process.env['PUBLISH_VERSION'];
  }
  const pkgPath = join(PROJECT_ROOT, 'sonarqube-cli', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
  return pkg.version;
}

function updatePackageVersion(pkgDir: string, version: string): void {
  const pkgPath = join(pkgDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as Record<string, unknown>;
  pkg['version'] = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

async function buildBundle(): Promise<void> {
  const outDir = join(PROJECT_ROOT, 'npm', 'sonarqube', 'bin');
  const outfile = join(outDir, 'sonar.js');

  mkdirSync(outDir, { recursive: true });

  console.log('Building JS bundle...');

  const result = await Bun.build({
    entrypoints: [join(PROJECT_ROOT, 'sonarqube-cli', 'src', 'index.ts')],
    outdir: outDir,
    naming: 'sonar.js',
    target: 'bun',
    format: 'esm',
    minify: false,
    packages: 'bundle',
  });

  if (!result.success) {
    for (const log of result.logs) {
      console.error(log);
    }
    throw new Error('Bundle build failed');
  }

  console.log(`  -> ${outfile}`);
}

async function main(): Promise<void> {
  const version = readVersion();
  console.log(`Building npm package for version ${version}\n`);

  // Update version in npm/sonarqube/package.json
  const pkgDir = join(PROJECT_ROOT, 'npm', 'sonarqube');
  updatePackageVersion(pkgDir, version);
  console.log('Updated version in npm/sonarqube/package.json');

  // Copy README and LICENSE into npm package (build artifacts, gitignored)
  copyFileSync(join(PROJECT_ROOT, 'README.md'), join(pkgDir, 'README.md'));
  copyFileSync(join(PROJECT_ROOT, 'LICENSE'), join(pkgDir, 'LICENSE'));
  console.log('Copied README.md and LICENSE into npm package\n');

  // Build JS bundle
  await buildBundle();

  console.log('\nBundle built successfully.');
}

main().catch((err: unknown) => {
  console.error('Build failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
