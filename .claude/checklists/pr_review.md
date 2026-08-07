---
id: chk_pr_review
version: 1.0.0
owner: AI_Architect
category: Checklist
---

# Checklist: Pull Request Review

## Preconditions
- The PR has a linked issue.
- CI pipeline is green.

## Execution
- Reviewer checks the code against standards.
- Reviewer tests the feature locally if UI changes are complex.

## Validation (The Checklist)
- [ ] **Types:** Are there any `any` types or `as` assertions hiding errors? (See `typescript.md`)
- [ ] **Security:** Is the `SERVICE_ROLE_KEY` exposed? Are RLS policies attached to new tables? (See `security.md`)
- [ ] **Performance:** Is there a risk of N+1 queries in the UI or missing indexes in the DB? (See `performance.md`)
- [ ] **Testing:** Were new tests added covering the happy path and boundary failures? (See `testing.md`)
- [ ] **Formatting:** Does the UI break on mobile? Are Tailwind classes grouped cleanly? (See `tailwind.md`)

## Common Failures
- Forgetting to commit the generated Supabase types after modifying the DB.
- Skipping tests to push a hotfix quickly.

## Recovery
- Revert the PR if a security vulnerability is merged, write an explicit test for the vulnerability, and submit a fix.

## References
- [standards/index.md](../standards/index.md)
