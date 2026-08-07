---
id: standard_react
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_typescript]
review_frequency: quarterly
last_updated: 2026-07-21
status: stable
priority: high
tags: [react, ui, frontend, components]
---

# React Standards

## Purpose
Define architectural boundaries and rendering conventions for React 19 UI components.

## Scope
Applies to all UI rendering, state management, and component architecture in the frontend.

## Applies To
- `frontend/src/components/**/*.tsx`
- `frontend/src/features/**/*.tsx`
- `frontend/src/pages/**/*.tsx`

## Required Rules
1. **TypeScript Only:** All components must adhere strictly to `standards/typescript.md`.
2. **Feature Folders:** Code must be organized by feature (e.g., `features/reviews/`) rather than by type (e.g., `components/`, `hooks/`) to encapsulate domain logic.
3. **Server vs Client:** React Server Components (RSC) principles apply where supported. Use `"use client"` only at the leaf nodes that require interactivity.
4. **Data Fetching:** All asynchronous data fetching must use React Query. No raw `useEffect` fetching.

## Recommended Practices
- **Component Anatomy:** Default export the component. Keep files under 200 lines.
- **State Management:** Lift state only when necessary. Prefer local component state, then React Context for feature-level state.
- **Props Interface:** Always name the props interface `[ComponentName]Props`.

## Anti-Patterns
- Using `useEffect` for data synchronization (use derived state or React Query).
- Prop drilling more than 3 levels deep (use Context or composition).
- Creating monolithic pages; break them into smaller feature components.

## Examples
```tsx
import { useQuery } from '@tanstack/react-query';

interface UserProfileProps {
  userId: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
  // Good: Using React Query instead of useEffect
  const { data, isLoading } = useQuery({ 
    queryKey: ['user', userId], 
    queryFn: () => fetchUser(userId) 
  });
  
  if (isLoading) return <Spinner />;
  return <div>{data.name}</div>;
}
```

## Validation Checklist
- [ ] No raw `fetch` inside `useEffect`.
- [ ] Strict typing applied to all props.
- [ ] Components are domain-colocated in `features/`.

## Related Standards
- [standards/typescript.md](typescript.md) (Typing)
- [standards/tailwind.md](tailwind.md) (Styling)
- [standards/performance.md](performance.md) (Rendering optimization)

## References
- [React Documentation](https://react.dev/)
