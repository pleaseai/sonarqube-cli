# @pleaseai/sonarqube

npm distribution of [SonarQube CLI](https://github.com/SonarSource/sonarqube-cli) for all major platforms, including macOS x64 (Intel).

## Installation

```bash
npm install -g @pleaseai/sonarqube
```

## Usage

```bash
sonar --help
```

## Supported Platforms

| Platform | Package |
|---|---|
| macOS arm64 | `@pleaseai/sonarqube-darwin-arm64` |
| macOS x64 | `@pleaseai/sonarqube-darwin-x64` |
| Linux x64 | `@pleaseai/sonarqube-linux-x64` |
| Linux arm64 | `@pleaseai/sonarqube-linux-arm64` |
| Windows x64 | `@pleaseai/sonarqube-win32-x64` |

Platform packages are installed automatically via npm's `optionalDependencies`.

## About

This repository packages the upstream [SonarSource/sonarqube-cli](https://github.com/SonarSource/sonarqube-cli) for npm distribution. The source code is included as a git submodule and is not modified.

## License

LGPL-3.0-or-later — see [LICENSE](LICENSE)
