---
id: research_evaluate_library
version: 1.0.0
owner: AI_Architect
category: Research
---

# Research Workflow: Evaluate Library

## Objective
Critically assess a third-party NPM or Deno library before introducing it into the dependency graph.

## Research Strategy
1. **Bundle Size:** Check Bundlephobia for size and tree-shaking support.
2. **Maintenance:** Check GitHub for recent commits, open issues, and PR response time.
3. **Typing:** Verify if it provides first-class TypeScript support (`d.ts`).
4. **Security:** Check for known CVEs.

## Evidence Requirements
- Must provide exact impact on the Vite build size.
- Must verify compatibility with React 19 / Deno.

## Decision Framework
- **Reject** if: It lacks TS types, adds > 50kb ungzipped for a trivial task, or relies on outdated CommonJS.
- **Accept** if: It's tree-shakeable, actively maintained, and solves a problem too complex to build in-house (e.g., date parsing, rich text).

## Expected Output
A short `research_notes.md` artifact detailing the evaluation against the decision framework, ending with a strict Accept/Reject recommendation.
