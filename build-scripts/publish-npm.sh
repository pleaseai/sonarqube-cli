#!/usr/bin/env bash
# SonarQube CLI - Publish npm package to registry
#
# Usage:
#   ./build-scripts/publish-npm.sh                        # publish stable (version from submodule)
#   ./build-scripts/publish-npm.sh --tag next             # publish prerelease with 'next' dist-tag
#   ./build-scripts/publish-npm.sh --dry-run              # dry run (stable)
#   ./build-scripts/publish-npm.sh --tag next --dry-run   # dry run (prerelease)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NPM_DIR="$PROJECT_ROOT/npm"

DRY_RUN=false
DIST_TAG="latest"

while [[ $# -gt 0 ]]; do
  case "${1}" in
    --dry-run) DRY_RUN=true ;;
    --tag) DIST_TAG="${2}"; shift ;;
    *) echo "Unknown option: ${1}"; exit 1 ;;
  esac
  shift
done

if [[ "$DRY_RUN" == true ]]; then
  echo "Running in dry-run mode (no packages will be published)"
fi

# Step 1: Determine version from npm/sonarqube/package.json
# For prerelease tags, append -{tag}.1 suffix
NPM_VERSION=$(node -e "console.log(require('$NPM_DIR/sonarqube/package.json').version)")
if [[ "$DIST_TAG" != "latest" ]]; then
  export PUBLISH_VERSION="${NPM_VERSION}-${DIST_TAG}.1"
else
  export PUBLISH_VERSION="${NPM_VERSION}"
fi
echo "==> Version: ${PUBLISH_VERSION} (dist-tag: ${DIST_TAG})"

# Step 2: Install submodule dependencies
# Use public npm registry to bypass SonarSource's private Artifactory (bunfig.toml)
echo ""
echo "==> Installing submodule dependencies..."
(cd "$PROJECT_ROOT/sonarqube-cli" && npm install --registry https://registry.npmjs.org --no-package-lock)

# Step 3: Build JS bundle
echo ""
echo "==> Building JS bundle..."
bun "$SCRIPT_DIR/build-npm.ts"

# Step 4: Publish main package
echo ""
echo "==> Publishing @pleaseai/sonarqube@${PUBLISH_VERSION}..."
if [[ "$DRY_RUN" == true ]]; then
  npm publish "$NPM_DIR/sonarqube" --access public --tag "$DIST_TAG" --dry-run
else
  npm publish "$NPM_DIR/sonarqube" --access public --tag "$DIST_TAG"
fi

echo ""
echo "Package published successfully (tag: ${DIST_TAG})."
