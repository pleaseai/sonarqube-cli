# @pleaseai/sonarqube

npm distribution of [SonarQube CLI](https://github.com/SonarSource/sonarqube-cli).

## Prerequisites

- [Bun](https://bun.sh/) runtime is required.

## Installation

```bash
bun install -g @pleaseai/sonarqube
```

## Usage

```bash
sonar --help
```

Or run without installing:

```bash
bunx @pleaseai/sonarqube --help
```

## Supported platforms

| OS      | Architecture      | npm package                        |
| ------- | ----------------- | ---------------------------------- |
| Linux   | x64               | `@pleaseai/sonarqube-linux-x64`    |
| Linux   | arm64             | `@pleaseai/sonarqube-linux-arm64`  |
| macOS   | arm64 (Apple Silicon) | `@pleaseai/sonarqube-darwin-arm64` |
| macOS   | **x64 (Intel)**   | `@pleaseai/sonarqube-darwin-x64`   |
| Windows | x64               | `@pleaseai/sonarqube-win32-x64`    |

> **macOS x64 (Intel) support**
>
> The official [SonarQube CLI](https://github.com/SonarSource/sonarqube-cli) does **not** ship a macOS x86-64 (Intel) build — Intel Mac support has been sunset upstream, and pull requests adding it ([#177](https://github.com/SonarSource/sonarqube-cli/pull/177), [#184](https://github.com/SonarSource/sonarqube-cli/pull/184)) were declined for that reason.
>
> This distribution builds and publishes a macOS Intel binary so that Intel Mac users can keep running the CLI.

## About

This repository packages the upstream [SonarSource/sonarqube-cli](https://github.com/SonarSource/sonarqube-cli) for npm distribution. The source code is included as a git submodule and is not modified.

## License

LGPL-3.0-or-later — see [LICENSE](LICENSE)
