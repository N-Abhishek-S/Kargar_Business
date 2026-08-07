---
id: bp_react_feature
version: 1.0.0
owner: AI_Architect
category: Blueprint
depends_on: [standard_react, standard_tailwind]
---

# Blueprint: React Feature Module

## Purpose
Scaffold a complete, isolated React feature domain containing its own components, hooks, and types, preventing monolithic `src/components/` bloat.

## When to use
Use when building a distinct business capability (e.g., `Reviews`, `Billing`, `Appointments`).

## Inputs
- `Feature Name` (PascalCase and kebab-case)
- `Primary Entity Interface`

## Outputs
- `frontend/src/features/[feature-name]/components/`
- `frontend/src/features/[feature-name]/hooks/`
- `frontend/src/features/[feature-name]/types.ts`
- `frontend/src/features/[feature-name]/index.ts`

## Related Standards & Skills
- **Standards:** [react.md](../standards/react.md), [typescript.md](../standards/typescript.md)
- **Skills:** [react_component.md](../skills/react_component.md)
- **Commands:** `/feature`, `/component`

## Validation Checklist
- [ ] Directory is completely self-contained.
- [ ] Only exposes public API via `index.ts`.

## Expected Generated Files

### 1. `types.ts`
```typescript
import { z } from 'zod';

export const EntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export type Entity = z.infer<typeof EntitySchema>;
```

### 2. `index.ts` (Public API)
```typescript
export * from './types';
export { FeatureMainComponent } from './components/FeatureMainComponent';
// Do not export internal utilities or sub-components.
```

### 3. `components/FeatureMainComponent.tsx`
```tsx
import React from 'react';
import { cn } from '@/utils/cn';
import { useFeatureData } from '../hooks/useFeatureData';
import type { Entity } from '../types';

export interface FeatureMainComponentProps {
  entityId: string;
  className?: string;
}

export function FeatureMainComponent({ entityId, className }: FeatureMainComponentProps) {
  const { data, isLoading, error } = useFeatureData(entityId);

  if (isLoading) return <div className="animate-pulse h-32 bg-gray-100 rounded-md" />;
  if (error) return <div className="text-red-600">Failed to load.</div>;
  if (!data) return null;

  return (
    <section className={cn("p-6 bg-white shadow-sm rounded-lg border", className)}>
      <h2 className="text-lg font-semibold">{/* Entity name */}</h2>
    </section>
  );
}
```

### 4. `hooks/useFeatureData.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import type { Entity } from '../types';

export function useFeatureData(id: string) {
  return useQuery({
    queryKey: ['feature-entity', id],
    queryFn: async (): Promise<Entity> => {
      // Implement Supabase call or API fetch here
      throw new Error("Not implemented");
    }
  });
}
```
