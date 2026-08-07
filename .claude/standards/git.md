---
id: standard_git
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: []
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: high
tags: [git, workflow, version-control]
---

# Git Workflow Standards

## Purpose
Maintain a clean, easily revertible, and understandable version control history.

## Scope
Applies to all commits, branches, and pull requests in the repository.

## Applies To
- Global repository workflow
- `.github/workflows/`

## Required Rules
1. **Conventional Commits:** All commit messages must follow the Conventional Commits specification (e.g., `feat:`, `fix:`, `chore:`, `refactor:`).
2. **Branch Naming:** Branches must be prefixed with the type of work and an optional ticket number (e.g., `feature/auth-login`, `fix/header-layout`).
3. **Atomic Commits:** Commits should represent a single logical change. Do not bundle unrelated refactoring with feature development.

## Recommended Practices
- Squash commits before merging into the main branch to keep the history linear and readable.
- Always write descriptive commit bodies when the "why" isn't immediately obvious from the code.

## Anti-Patterns
- Vague commit messages (`"fixed stuff"`, `"wip"`).
- Giant PRs (over 500 lines of changes); break them into smaller, reviewable chunks.
- Committing generated build files or secrets (ensure `.gitignore` is strictly enforced).

## Examples
```text
// Good Commit Message
feat(auth): implement Supabase magic link login

- Added magic link form in LoginForm.tsx
- Created Auth API utility
- Closes #123
```

## Validation Checklist
- [ ] Commit message follows conventional format.
- [ ] No secrets or `.env` files are tracked.
- [ ] PR passes all GitHub Actions checks before merge.

## Related Standards
- [standards/security.md](security.md) (Secret management)

## References
- [Conventional Commits](https://www.conventionalcommits.org/)
