---
id: standard_accessibility
version: 1.0.0
owner: AI_Architect
category: Standard
depends_on: [standard_react, standard_tailwind]
review_frequency: semi-annually
last_updated: 2026-07-21
status: stable
priority: medium
tags: [a11y, aria, keyboard, wcag]
---

# React Accessibility Standards

## Purpose
Ensure the UI is fully usable by all individuals, integrating WCAG best practices directly into React component design and interactive elements.

## Scope
Applies to interactive React components, forms, dialogs, semantic HTML structures, and motion logic.

## Applies To
- `frontend/src/components/**/*.tsx`
- `frontend/src/features/**/*.tsx`

## Required Rules
1. **Keyboard Navigability:** All interactive elements (`button`, `a`, `input`, `select`) must be reachable via `Tab` and triggerable via `Enter`/`Space`.
2. **Focus Management:** Modals, dialogs, and slide-overs must trap focus while open and return focus to the triggering element upon closing.
3. **ARIA Roles:** Use native semantic HTML elements (`<nav>`, `<main>`, `<dialog>`) over generic `<div>` tags. Use ARIA attributes (`aria-expanded`, `aria-hidden`) only when semantic HTML falls short.
4. **Form Labels:** Every input must have a programmatic association with a `<label>` (via `htmlFor`).

## Recommended Practices
- **Motion Reduction:** Respect user OS preferences for reduced motion by wrapping Framer Motion / GSAP animations in `useReducedMotion()` checks or `motion-safe:` Tailwind classes.
- **Color Contrast:** Use Tailwind's color palette to ensure a minimum contrast ratio of 4.5:1 for normal text.

## Anti-Patterns
- Using `<div onClick={...}>` without `role="button"` and `tabIndex={0}`.
- Suppressing focus outlines entirely (`outline-none` without a visual fallback like `focus:ring`).
- Empty `alt` attributes on informative images (they should only be empty `alt=""` for purely decorative images).

## Examples
```tsx
// Good: Accessible dialog trigger and focus management (simplified)
import { useState, useRef, useEffect } from 'react';

export function AccessibleModal() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) triggerRef.current?.focus(); // Return focus
  }, [isOpen]);

  return (
    <>
      <button 
        ref={triggerRef} 
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        Open Settings
      </button>

      {isOpen && (
        <dialog open aria-modal="true" className="focus:outline-none">
          <h2>Settings</h2>
          <button autoFocus onClick={() => setIsOpen(false)}>Close</button>
        </dialog>
      )}
    </>
  );
}
```

## Validation Checklist
- [ ] Interactive elements are keyboard navigable.
- [ ] No `eslint-plugin-jsx-a11y` errors are present.
- [ ] Contrast ratios meet minimum thresholds.

## Related Standards
- [standards/react.md](react.md) (Component architecture)
- [standards/tailwind.md](tailwind.md) (`motion-safe` utilities)

## References
- [W3C ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
