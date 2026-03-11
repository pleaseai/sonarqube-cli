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
 * Build all platform npm binaries for @pleaseai/sonarqube
 *
 * Usage: bun build-scripts/build-npm.ts
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = dirname(__dirname);

interface Platform {
  /** npm package directory name under npm/ */
  dir: string;
  /** bun --target value */
  target: string;
  /** output binary filename */
  binary: string;
}

const PLATFORMS: Platform[] = [
  { dir: 'sonarqube-darwin-arm64', target: 'bun-darwin-arm64', binary: 'sonar' },
  { dir: 'sonarqube-darwin-x64', target: 'bun-darwin-x64', binary: 'sonar' },
  { dir: 'sonarqube-linux-x64', target: 'bun-linux-x64', binary: 'sonar' },
  { dir: 'sonarqube-linux-arm64', target: 'bun-linux-arm64', binary: 'sonar' },
  { dir: 'sonarqube-win32-x64', target: 'bun-windows-x64', binary: 'sonar.exe' },
];

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

  // Update optionalDependencies versions if present
  if (pkg['optionalDependencies'] && typeof pkg['optionalDependencies'] === 'object') {
    const deps = pkg['optionalDependencies'] as Record<string, string>;
    for (const key of Object.keys(deps)) {
      deps[key] = version;
    }
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function buildPlatform(platform: Platform, version: string): void {
  const binDir = join(PROJECT_ROOT, 'npm', platform.dir, 'bin');
  const outfile = join(binDir, platform.binary);

  mkdirSync(binDir, { recursive: true });

  console.log(`Building ${platform.dir} (${platform.target})...`);

  execSync(
    `bun build sonarqube-cli/src/index.ts --compile --target=${platform.target} --outfile="${outfile}"`,
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    },
  );

  console.log(`  -> ${outfile}`);
}

async function main(): Promise<void> {
  const version = readVersion();
  console.log(`Building npm packages for version ${version}\n`);

  // Update versions in all npm package.json files
  const allPackageDirs = ['sonarqube', ...PLATFORMS.map((p) => p.dir)];

  for (const dir of allPackageDirs) {
    const pkgDir = join(PROJECT_ROOT, 'npm', dir);
    updatePackageVersion(pkgDir, version);
    console.log(`Updated version in npm/${dir}/package.json`);
  }

  // Copy README and LICENSE into npm packages (build artifacts, gitignored)
  copyFileSync(join(PROJECT_ROOT, 'README.md'), join(PROJECT_ROOT, 'npm', 'sonarqube', 'README.md'));
  copyFileSync(join(PROJECT_ROOT, 'LICENSE'), join(PROJECT_ROOT, 'npm', 'sonarqube', 'LICENSE'));
  for (const platform of PLATFORMS) {
    copyFileSync(
      join(PROJECT_ROOT, 'LICENSE'),
      join(PROJECT_ROOT, 'npm', platform.dir, 'LICENSE'),
    );
  }
  console.log('Copied README.md and LICENSE into npm packages\n');

  // Build each platform binary
  for (const platform of PLATFORMS) {
    buildPlatform(platform, version);
  }

  console.log('\nAll platform binaries built successfully.');
}

main().catch((err: unknown) => {
  console.error('Build failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
