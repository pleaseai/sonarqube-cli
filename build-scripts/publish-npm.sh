#!/usr/bin/env bash
# SonarQube CLI - Publish npm packages to registry
#
# Usage:
#   ./build-scripts/publish-npm.sh              # publish to registry
#   ./build-scripts/publish-npm.sh --dry-run    # dry run only

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NPM_DIR="$PROJECT_ROOT/npm"

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "Running in dry-run mode (no packages will be published)"
fi

PLATFORM_PACKAGES=(
  "sonarqube-darwin-arm64"
  "sonarqube-darwin-x64"
  "sonarqube-linux-x64"
  "sonarqube-linux-arm64"
  "sonarqube-win32-x64"
)

# Step 1: Install submodule dependencies
# Use public npm registry to bypass SonarSource's private Artifactory (bunfig.toml)
echo "==> Installing submodule dependencies..."
npm install --prefix "$PROJECT_ROOT/sonarqube-cli" --registry https://registry.npmjs.org

# Step 2: Build all platform binaries
echo ""
echo "==> Building all platform binaries..."
bun "$SCRIPT_DIR/build-npm.ts"

# Step 3: Publish platform packages
echo ""
echo "==> Publishing platform packages..."
for pkg in "${PLATFORM_PACKAGES[@]}"; do
  echo "  Publishing @pleaseai/$pkg..."
  if [[ "$DRY_RUN" == true ]]; then
    npm publish "$NPM_DIR/$pkg" --access public --dry-run
  else
    npm publish "$NPM_DIR/$pkg" --access public
  fi
done

# Step 4: Publish main package last
echo ""
echo "==> Publishing main package @pleaseai/sonarqube..."
if [[ "$DRY_RUN" == true ]]; then
  npm publish "$NPM_DIR/sonarqube" --access public --dry-run
else
  npm publish "$NPM_DIR/sonarqube" --access public
fi

echo ""
echo "All packages published successfully."
