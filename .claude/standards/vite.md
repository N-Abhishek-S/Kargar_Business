---
id: standard_vite
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_react]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: medium
tags: [build, tooling, vite, bundler]
---

# Vite Standards

## Purpose
Ensure rapid development server startup and highly optimized production builds using Vite.

## Scope
Applies to the Vite configuration, plugins, and build pipeline.

## Applies To
- `frontend/vite.config.ts`
- `frontend/index.html`
- Asset importing strategies

## Required Rules
1. **Absolute Imports:** Configure Vite and TypeScript paths to use absolute imports (e.g., `@/components/`) to prevent fragile relative paths.
2. **Environment Variables:** All environment variables must be prefixed with `VITE_` and accessed safely via `import.meta.env`.
3. **Build Target:** Target modern browsers (ES2022+) to leverage native ES modules and reduce bundle size.

## Recommended Practices
- Leverage Vite's native dynamic imports `import()` for code splitting on route boundaries.
- Keep `vite.config.ts` clean; extract complex plugin logic into separate files if necessary.

## Anti-Patterns
- Importing large CommonJS dependencies that do not tree-shake well.
- Placing unoptimized, massive media files in `/src/assets` instead of `/public` (if they don't need bundling/hashing).

## Examples
```typescript
// Good: Dynamic import for code splitting
const AdminDashboard = React.lazy(() => import('@/features/admin/Dashboard'));
```

## Validation Checklist
- [ ] Absolute imports are configured and used.
- [ ] No `.env` secrets are leaked into the bundle (strict `VITE_` prefixing).
- [ ] Build completes without unresolved dependency warnings.

## Related Standards
- [standards/react.md](react.md) (React integration)
- [standards/performance.md](performance.md) (Bundle analysis)

## References
- [Vite Documentation](https://vitejs.dev/)
