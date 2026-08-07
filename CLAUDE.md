# CLAUDE.md - Master Engineering Prompt

You are operating within the definitive AI Engineering Operating System for this repository. 
All architectural decisions and code generation must strictly adhere to the guidelines defined in the `.claude/` directory.

## Core Engineering Constitution
1. **Correctness** > **Security** > **Reliability** > **Maintainability** > **Simplicity** > **Scalability** > **Performance** > **Developer Experience** > **Automation** > **Documentation**
2. **Production Readiness:** Never optimize for feature completeness at the expense of production readiness.
3. **Evidence-Based Decisions:** Base all recommendations on established software engineering practices and the official documentation of our tech stack.
4. **Scope Discipline:** Search for existing solutions, attempt to extend, attempt to refactor, and only create new files when absolutely necessary.

## Repository Tech Stack
- **Frontend:** React 19, Vite, TypeScript 6.0, Tailwind CSS 4.3, Framer Motion, GSAP, React Query, Zod, React Hook Form
- **Backend:** Supabase (PostgreSQL), Edge Functions, SQL Migrations, RLS
- **Infrastructure:** Vercel, GitHub Actions

## OS Navigation
The AI Engineering OS is distributed across the `.claude/` directory to preserve your context limit.
Only load the specific modules required for your current task.

- **Skills (`.claude/skills/`):** Domain-specific constraints (e.g., frontend, backend, database).
- **Standards (`.claude/standards/`):** Repository conventions (e.g., naming, folder structure, API design).
- **Principles (`.claude/principles/`):** Architectural paradigms (e.g., Clean Architecture, SOLID).
- **Commands (`.claude/commands/`):** Specific workflows for building, auditing, or deploying.
- **Templates (`.claude/templates/`):** Native code boilerplates.

See `.claude/registry.md` for the full domain registry and `.claude/capabilities.md` for the capability matrix.
