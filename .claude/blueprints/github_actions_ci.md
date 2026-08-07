---
id: bp_github_actions_ci
version: 1.0.0
owner: AI_Architect
category: Blueprint
depends_on: [standard_testing, standard_git]
---

# Blueprint: GitHub Actions CI Pipeline

## Purpose
Automate testing, linting, and type-checking on every Pull Request to enforce engineering standards before code reaches `main`.

## When to use
Scaffolding a new repository or migrating CI/CD providers.

## Inputs
- None

## Outputs
- `.github/workflows/ci.yml`

## Related Standards & Skills
- **Standards:** [testing.md](../standards/testing.md), [git.md](../standards/git.md)
- **Skills:** [testing.md](../skills/testing.md)

## Validation Checklist
- [ ] Includes Node.js caching.
- [ ] Blocks PR if `tsc --noEmit` fails.
- [ ] Blocks PR if Vitest fails.

## Expected Generated Files

### 1. `.github/workflows/ci.yml`
```yaml
name: CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  validate:
    name: Validate Codebase
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: './frontend/package-lock.json'

      - name: Install dependencies
        run: npm ci

      - name: Type Check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Unit & Component Tests
        run: npm run test:run

      - name: Build Check
        run: npm run build
```
