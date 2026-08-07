---
id: standard_tailwind
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_react]
review_frequency: quarterly
last_updated: 2026-07-21
status: stable
priority: high
tags: [css, styling, tailwind, ui]
---

# Tailwind CSS Standards

## Purpose
Ensure consistent, maintainable, and highly optimized styling across the frontend using Tailwind v4.

## Scope
Applies to all CSS generation and inline styling within React components.

## Applies To
- `frontend/src/**/*.tsx`
- `frontend/src/index.css`

## Required Rules
1. **Utility-First:** Use Tailwind utility classes exclusively. Avoid writing custom CSS in `index.css` unless defining base layer global variables or complex keyframes.
2. **Class Merging:** Always use `clsx` and `tailwind-merge` (via a generic `cn()` utility) when composing conditional class names to prevent style conflicts.
3. **Design Tokens:** Strictly adhere to the configured color palette and spacing variables in the Tailwind configuration. Do not use arbitrary values (e.g., `w-[327px]`) unless absolutely necessary for a highly specific layout.

## Recommended Practices
- **Component Abstraction:** If a combination of utility classes is repeated more than 3 times, extract it to a React UI component (e.g., `<Button>`) rather than using `@apply` in CSS.
- **Responsive Design:** Mobile-first approach. Use `sm:`, `md:`, `lg:` in that order.

## Anti-Patterns
- Using `@apply` extensively in CSS files (defeats the purpose of Tailwind).
- String concatenation for class names (`className={"flex " + (isActive ? "bg-red" : "")}`).
- Magic numbers in arbitrary values (`h-[47px]`).

## Examples
```tsx
// Good: Using clsx and tailwind-merge (cn utility)
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-colors",
        variant === 'primary' ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-900",
        className
      )}
      {...props}
    />
  );
}
```

## Validation Checklist
- [ ] No custom CSS classes for layout or typography.
- [ ] Conditional classes use `cn()` / `clsx`.
- [ ] No arbitrary values used when a design token exists.

## Related Standards
- [standards/react.md](react.md) (Component abstraction)

## References
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
