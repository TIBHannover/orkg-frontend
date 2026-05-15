<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# ORKG Frontend – Copilot Instructions

This is the frontend for the **Open Research Knowledge Graph (ORKG)**, a Next.js (App Router) application with React and TypeScript.

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Start production server

# Testing
npm test             # Run tests in watch mode (Vitest)
npm run test:ci      # Run all tests once (CI mode)

# Run a single test file
npx vitest run src/path/to/file.test.tsx

# Code quality
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript type check (tsc --noEmit)

# Commits
npm run commit       # Interactive Commitizen prompt (required format)

# Storybook
npm run storybook    # Start Storybook at http://localhost:6006
```

## Architecture Overview

This is a **Next.js 16** app (App Router) built with **React 19** using:

- **HeroUI v3 + Tailwind CSS v4** for UI components and styling
- **styled-components** for legacy component styling (still in use alongside Tailwind)
- **Redux Toolkit** for global state (legacy — prefer local state, URL state via nuqs, or React context for complex cases)
- **SWR** for data fetching
- **API Client**: `@orkg/orkg-client` (OpenAPI-generated), `ky` for other APIs
- **NextAuth v4 + Keycloak** for authentication
- **nuqs** for URL search param state management

### Directory Structure

```
src/
├── app/              # Next.js App Router pages (routes mirror URL structure)
├── components/       # React components
│   ├── Ui/           # Legacy wrappers (being removed — use @heroui/react directly)
│   ├── hooks/        # Custom hooks (useAuthentication, useContributor, etc.)
│   └── ...           # Feature-specific components
├── services/
│   ├── backend/      # ORKG API calls (one file per resource type)
│   └── ...           # Third-party service clients (ols, semanticScholar, etc.)
├── slices/           # Redux slices (legacy — pdfAnnotation, templateEditor, viewPaper)
├── constants/        # App-wide constants (routes, graph settings, data types)
│   └── graphSettings.ts  # ORKG ontology IDs: CLASSES, PREDICATES, etc.
├── lib/              # namedRoute.ts (reverse() for building typed URLs)
└── testUtils.tsx     # Custom render() wrapping all providers for tests
```

### Key Patterns

**Authentication**: Use `useAuthentication` from `@/components/hooks/useAuthentication` — never `useSession` from `next-auth/react` directly (ESLint enforces this). The hook decodes the Keycloak JWT and exposes user roles.

**Route params**: Use `useParams` from `@/components/useParams` (not `next/navigation`) — ESLint enforces this.

**API calls**: All ORKG backend calls go through `src/services/backend/`. The `@orkg/orkg-client` package provides a typed API client configured in `src/services/backend/backendApi.ts`. Auth tokens are managed automatically (cached, refreshed on expiry).

**Imports**: Use absolute imports with `@/` prefix (maps to `src/`). Relative imports trigger an ESLint warning. Import order is enforced by `eslint-plugin-simple-import-sort`.

**ORKG ontology IDs**: Never hardcode class or predicate IDs (e.g. `'P26'`). Always import from `@/constants/graphSettings.ts` (`CLASSES`, `PREDICATES`).

**Navigation**: Build URLs using `reverse()` from `@/lib/namedRoute` with route patterns from `@/constants/routes`:

```typescript
import { reverse } from '@/lib/namedRoute';
import ROUTES from '@/constants/routes';
<Link href={reverse(ROUTES.PAPER, { resourceId })}>View Paper</Link>
```

**Server vs. client components**: Default to server components for data fetching and static content. Add `'use client'` only when using hooks, browser APIs, or event handlers.

**Styling**: Tailwind CSS is the current standard. `styled-components` is still present for legacy code but being phased out — do not use it for new code.

**File conventions**: Each component lives in its own PascalCase folder (e.g. `LoadingComponent/LoadingComponent.tsx`). One component per file. Components and hooks use a default export. Colocate components in `app/` if not reused elsewhere; move to `components/` when shared.

**TypeScript**: Avoid `any`; use `unknown` or proper types. Use types from `@orkg/orkg-client` where available.

**UI Components**: `src/components/Ui/` contains wrappers that were created during the migration from reactstrap to HeroUI (the wrappers originally used reactstrap and blocked direct reactstrap imports). The migration to HeroUI is complete but the wrappers are now overly complex and partially broken. **Import HeroUI directly** (`@heroui/react`) rather than using these wrappers. The wrappers are being phased out — do not add new usage of them, and prefer replacing wrapper usage with direct HeroUI components when touching existing code.

### Testing

Tests use **Vitest** + **React Testing Library** + **MSW** for API mocking. Import `render` from `@/testUtils` (not `@testing-library/react`) — it wraps components with Redux, ThemeProvider, SWR, MathJax, and Nuqs providers.

### Commit Convention

Commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/) with [Angular types](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). Use `npm run commit` for an interactive prompt. The commit hook will reject incorrectly formatted messages.

### TypeScript Migration

The project is actively migrating from JavaScript to TypeScript. New components should be written in TypeScript (`.ts`/`.tsx`).

### Rules with examples

**Fetching Data in Components**

```typescript
// Server component
export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const resource = await getResource(id);
    return <ResourceView resource={resource} />;
}

// Client component with SWR
'use client';
import useSWR from 'swr';

export default function LiveStats() {
    const { data } = useSWR('/api/stats', fetcher);
    return <div>Count: {data?.count}</div>;
}
```

**Component Props: Use TypeScript type, destructure in parameters**

```typescript
type MyComponentProps = {
    title: string;
    count?: number;
    onUpdate: (value: string) => void;
};

const MyComponent = ({ title, count = 0, onUpdate }: MyComponentProps) => {
    // ...
};
```
