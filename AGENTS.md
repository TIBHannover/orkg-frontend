# ORKG Frontend – Copilot Instructions

This is the frontend for the **Open Research Knowledge Graph (ORKG)**, a Next.js (App Router) application with React and TypeScript.

## Architecture Overview

### Tech Stack

-   **Framework**: Next.js 15 with App Router (`src/app/`)
-   **React**: 19 with React Compiler (Babel)
-   **TypeScript**: Gradual migration in progress – prefer TypeScript for new files
-   **State**: useContext for complex state but prefer local state, or URL state, when possible.
-   **Styling**: Bootstrap 5 + Reactstrap → Tailwind CSS migration (use `tw:` prefix for Tailwind utilities)
-   **API Client**: `@orkg/orkg-client` (OpenAPI-generated), `ky` for other APIs

### Project Structure

```
src/
├── app/                    # Next.js App Router pages & layouts
├── components/             # Reusable React components
├── services/               # API clients and service layer
│   ├── backend/           # @orkg/orkg-client wrapper functions
│   └── [external]/        # Third-party API integrations (ky-based)
├── slices/                # Redux slices (legacy, prefer local state)
├── constants/             # App-wide constants including graphSettings
│   └── graphSettings.ts   # ORKG ontology IDs (CLASSES, PREDICATES, etc.)
├── helpers/               # Utility functions
├── types/                 # TypeScript type definitions
└── assets/                # Static assets and global styles
```

## Key Patterns

-   The ORKG backend uses a knowledge graph with predefined classes and predicates. **Always import from `@/constants/graphSettings.ts`** rather than hardcoding IDs.
-   ORKG Backend API: Uses `@orkg/orkg-client` (OpenAPI-generated types) when interacting with the ORKG backend. OpenAPI spec: https://orkg.org/api
-   External APIs: Use `ky` with service-specific instances.
-   Default to server components for data fetching and static content.
-   Use `'use client'` directive only when needed (hooks, browser APIs, event handlers).
-   Styling:
    -   Migration in progress: Use Tailwind for new components, migrate legacy Bootstrap classes gradually.
    -   Tailwind classes **MUST** use the `tw:` prefix (custom v4-style variant).
    -   Prefer Tailwind classes over inline styles.
    -   Do not use styled components, we are migrating away from them.
-   States:
    -   Use local state when possible.
    -   Use `nuqs` for managing URL states.
    -   For complex cases, useContext.
-   TypeScript:
    -   Prefer `.tsx`/`.ts` for new files.
    -   Use `@orkg/orkg-client` types where available.
    -   Avoid `any`; use `unknown` or proper types.
-   Commit Conventions:
    -   Required: [Conventional Commits](https://www.conventionalcommits.org/) with [Angular types](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type).
    -   Husky enforces lint and formatting on commit.
-   Imports:
    -   Use `@/` alias for absolute imports (configured in `tsconfig.json`).
    -   Always import from React if needed; prefer: `FormEvent` over `React.FormEvent`.
-   File structure:
    -   Each component is PascalCased and has its own folder: e.g., `./LoadingComponent/LoadingComponent.tsx`.
    -   Use colocation of components in the `./app` folder if components are not reused. If they are reused, move them to the `./components/` folder.
    -   Each file has only a single component.
    -   Components and hooks always have a default export, e.g., `export default useCreateContentType;`.

#### Rules with examples

## Fetching Data in Components

```typescript
// Server component
export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const resource = await getResource(id);
    return <ResourceView resource={resource} />;
}

// Client component with SWR
('use client');
import useSWR from 'swr';

export default function LiveStats() {
    const { data } = useSWR('/api/stats', fetcher);
    return <div>Count: {data?.count}</div>;
}
```

## Creating Navigation Links

```typescript
import Link from 'next/link';
import { reverse } from 'named-urls';
import ROUTES from '@/constants/routes';

<Link href={reverse(ROUTES.VIEW_PAPER, { resourceId })}>View Paper</Link>;
```

## Component Props: Use TypeScript interfaces, destructure in parameters

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

## Development Workflow

### Running the App

```bash
npm run dev           # Start dev server (with Turbopack)
npm run build         # Production build
npm run test          # Run tests (Vitest watch mode)
npm run lint          # ESLint check
npm run type-check    # TypeScript compilation check
```

## Additional Resources

-   [Project Wiki](https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/home)
-   [Storybook Components](https://tibhannover.gitlab.io/orkg/orkg-frontend/storybook/)
-   [Backend Repository](https://gitlab.com/TIBHannover/orkg/orkg-backend)
-   [Contributing Guide](./CONTRIBUTING.md)
