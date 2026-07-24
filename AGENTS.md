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

**DataBrowser dialog & history state**: a plain `DataBrowserDialog` needs only `id`/`show`/`toggleModal` — it keeps navigation history provider-local and derives its own header from the browsed entity (no `label`, `type`, or `historyStorage` props). Embedded `DataBrowser`s and scoped comparison dialogs keep history in the `?history=` URL param instead; never combine `historyStorage="local"` with `scopeKey`. Render in-browser navigation links with `HistoryLink` (`@/components/DataBrowser/components/HistoryLink`) rather than hand-rolled anchors, and never subscribe to the `history` param from per-cell comparison components. The schema doc lives on `schemaHistory` in `src/components/DataBrowser/types/DataBrowserTypes.ts`; the contract tests in `src/components/DataBrowser/hooks/__tests__/useHistory.test.ts` are the executable spec.

**Server vs. client components**: Default to server components for data fetching and static content. Add `'use client'` only when using hooks, browser APIs, or event handlers.

**Styling**: Tailwind CSS is the current standard. `styled-components` is still present for legacy code but being phased out — do not use it for new code.

**File conventions**: Each component lives in its own PascalCase folder (e.g. `LoadingComponent/LoadingComponent.tsx`). One component per file. Components and hooks use a default export. Colocate components in `app/` if not reused elsewhere; move to `components/` when shared.

**TypeScript**: Avoid `any`; use `unknown` or proper types. Use types from `@orkg/orkg-client` where available.

**UI Components**: `src/components/Ui/` contains wrappers that were created during the migration from reactstrap to HeroUI (the wrappers originally used reactstrap and blocked direct reactstrap imports). The migration to HeroUI is complete but the wrappers are now overly complex and partially broken. **Import HeroUI directly** (`@heroui/react`) rather than using these wrappers. The wrappers are being phased out — do not add new usage of them, and prefer replacing wrapper usage with direct HeroUI components when touching existing code.

**Forms**: Build new forms with react-hook-form + zod via `useZodForm` (`@/components/Form/hooks/useZodForm`) and the `Controlled*` field components in `src/components/Form/`. Feed source data through the reactive `values` option, not `defaultValues`. Surface backend (RFC 9457) submit errors with `applyServerErrorsToForm` (`@/components/Form/utils/applyServerErrors`) + `<FormRootError>` (`@/components/Form/FormRootError`) rather than a generic toast. For forms rendered in a modal, guard the close paths against unsaved input with `useConfirmDiscardChanges` (`@/components/Form/hooks/useConfirmDiscardChanges`) — pass `formState.isDirty` and the modal's close callback, then route the modal's `onOpenChange` through the returned `requestClose`. See the examples under "Rules with examples".

### Testing

Tests use **Vitest** + **React Testing Library** + **MSW** for API mocking. Import `render` from `@/testUtils` (not `@testing-library/react`) — it wraps components with Redux, ThemeProvider, SWR, MathJax, and Nuqs providers.

### Commit Convention

Commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/) with [Angular types](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). Use `npm run commit` for an interactive prompt. The commit hook will reject incorrectly formatted messages.

### TypeScript Migration

The project is actively migrating from JavaScript to TypeScript. New components should be written in TypeScript (`.ts`/`.tsx`).

### Rules with examples

**Fetching Data in Components**

Server components fetch directly:

```typescript
export default async function ResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const resource = await getResource(id);
    return <ResourceView resource={resource} />;
}
```

Client components **always use SWR — never `useEffect` + `useState`**. The SWR key is a 3-tuple, `[params, serviceUrl, 'serviceFunctionName']`:

- `params` — the argument passed to the service function. SWR hashes keys structurally, so inline objects are fine: no `useMemo`/`useCallback` needed.
- `serviceUrl` — the `*Url` token exported alongside the service function (`resourcesUrl`, `statementsUrl`, `nlpServiceUrl`, …). It is a cache namespace only; it is never used to fetch.
- The third element is the service function's name as a string literal.

The fetcher is always inline and destructures the key. There is **no global fetcher** — `src/services/SWRConfig.ts` only disables revalidation.

```tsx
'use client';
import useSWR from 'swr';

import { getResource, resourcesUrl } from '@/services/backend/resources';

const ResourceView = ({ id }: { id?: string }) => {
    const { data, isLoading, error, mutate } = useSWR(
        id ? [id, resourcesUrl, 'getResource'] : null, // a null key means "don't fetch"
        ([params]) => getResource(params),
        { shouldRetryOnError: false }, // for anything that can 404 — SWR retries by default
    );

    if (isLoading) return <LoadingComponent />;
    if (error) return <NotFound />;
    return <div>{data?.label}</div>;
};
```

- Loading → `isLoading`. Failure → `error`. A "reload"/"try again" button → `mutate()`.
- On a `mutate()` refresh SWR keeps the previous `data` and reports `isLoading === false`. If you need a spinner there, use `isLoading || isValidating`.
- Multi-step fetches: chain them inside the fetcher and key on the entry-point call.
- Paginated lists: use `usePaginate` (`@/components/PaginatedContent/hooks/usePaginate`).
- Every input that affects the fetcher's **output** must be in the key — including params that aren't sent to the API but change how the result is derived. Otherwise two components collide on one cache entry.

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

**Forms: react-hook-form + zod**

Use `useZodForm` + the `Controlled*` field components (`src/components/Form/`) for every new form. Define a zod schema, infer the value type, and feed source data through the reactive `values` option (not `defaultValues`).

```tsx
'use client';
import { Form } from '@heroui/react';
import { z } from 'zod';

import ControlledTextField from '@/components/Form/ControlledTextField/ControlledTextField';
import useZodForm from '@/components/Form/hooks/useZodForm';

const schema = z.object({ name: z.string().trim().min(1, 'Please enter a name') });
type FormValues = z.infer<typeof schema>;

const MyForm = ({ data }: { data: FormValues }) => {
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useZodForm({ schema, values: data }); // reactive `values`, not `defaultValues`

    const onSubmit = async (values: FormValues) => {
        /* ... */
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <ControlledTextField control={control} name="name" label="Name" isDisabled={isSubmitting} />
        </Form>
    );
};
```

**Forms: handling backend errors (RFC 9457)**

In the submit `catch`, map the backend problem response onto the form with `applyServerErrorsToForm` (default export of `@/components/Form/utils/applyServerErrors`). Field errors are matched from the problem's `pointer` and render inline via the `Controlled*` components; anything that can't be tied to a field — unmapped field errors and non-field (occurrence-level) problems — is collected into a single `root.server` error that `<FormRootError>` renders as a form-level alert. The call returns `false` for non-problem errors (e.g. a network failure) so you can fall back to a toast.

- Pass `knownFields` (typically `Object.keys(schema.shape)`) so errors that don't resolve to a real field fall back to the alert instead of silently disappearing.
- Use `fieldMap` only when a backend field name differs from the form field (e.g. the org update sends `url` but the form field is `homepage`). Wrapped pointers like `/properties/url` are also resolved via their last segment, so the map key is the bare field name (`url`).

```tsx
import { toast } from '@heroui/react';

import FormRootError from '@/components/Form/FormRootError/FormRootError';
import applyServerErrorsToForm from '@/components/Form/utils/applyServerErrors';

const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
} = useZodForm({ schema, values: data });

const onSubmit = async (values: FormValues) => {
    try {
        await save(values);
    } catch (error) {
        const handled = await applyServerErrorsToForm(error, {
            setError,
            fieldMap: { url: 'homepage' }, // backend field -> form field (only when names differ)
            knownFields: Object.keys(schema.shape),
        });
        if (!handled) {
            toast.warning('Something went wrong');
        }
    }
};

return (
    <Form onSubmit={handleSubmit(onSubmit)}>
        <FormRootError message={errors.root?.server?.message} />
        <ControlledTextField control={control} name="name" label="Name" isDisabled={isSubmitting} />
    </Form>
);
```

The underlying parser (`parseProblemDetails` / `normalizeProblemDetails` in `@/services/backend/problemDetails`) normalizes the RFC 9457 body across both HTTP transports (the `@orkg/orkg-client` `ResponseError` and `ky`), reading the new fields with a fallback to the deprecated ones (`error`/`path`/`timestamp`/`errors[].field`). The shared `errorHandler` (`@/helpers/errorHandler`) and `getErrorMessage` (`@/utils`) helpers build on the same normalizer. `src/components/Organization/EditOrganization.tsx` is the reference implementation.
