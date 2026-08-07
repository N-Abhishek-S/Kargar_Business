---
id: standard_observability
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_react, standard_supabase]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: medium
tags: [logging, errors, monitoring, telemetry]
---

# Observability & Error Handling

## Purpose
Ensure rapid diagnosis of production issues through structured logging, resilient error boundaries, and telemetry tracking.

## Scope
Applies to Edge Function logs, React error boundaries, and client-side error reporting.

## Applies To
- `frontend/src/utils/logger.ts` (or similar)
- `frontend/src/components/ErrorBoundaries/`
- `supabase/functions/**/*.ts`

## Required Rules
1. **Structured Logging:** Edge functions must log payloads in a structured JSON format to be easily parsed by log aggregators.
2. **React Error Boundaries:** The React component tree must implement Error Boundaries at the feature level to prevent the entire SPA from crashing during a localized exception.
3. **No Silent Failures:** Caught exceptions (`catch (e)`) must either be handled with a fallback state or explicitly logged. Never leave empty catch blocks.

## Recommended Practices
- **Sanitization:** Strip sensitive PII (Passwords, tokens) before transmitting error telemetry to observability platforms (e.g., Sentry, DataDog).
- **Client Telemetry:** Track critical user flow drop-offs (e.g., failed form submissions) to monitor UX degradation.

## Anti-Patterns
- Leaking stack traces to the end user in the production UI.
- Flooding the console with `console.log()` in production builds (use a wrapper that disables debug logs in `NODE_ENV=production`).

## Examples
```tsx
// Good: React Error Boundary Implementation
import React from 'react';

export class FeatureErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Ship to structured logging service
    logToObservabilityService({ error, context: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-50 text-red-700 rounded-md">Something went wrong in this section.</div>;
    }
    return this.props.children;
  }
}
```

## Validation Checklist
- [ ] `console.error` in production is wrapped or routed to telemetry.
- [ ] Edge function exceptions are logged as structured JSON.
- [ ] PII is stripped from telemetry logs.

## Related Standards
- [standards/react.md](react.md) (Component boundaries)
- [standards/supabase.md](supabase.md) (Edge function error handling)
- [standards/security.md](security.md) (PII masking)
