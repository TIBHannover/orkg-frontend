import { useSearchParams } from 'next/navigation';
import { createSerializer, Options, parseAsJson, useQueryState } from 'nuqs';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import { History, HistoryEntry, schemaHistory } from '@/components/DataBrowser/types/DataBrowserTypes';

// The schema and its doc comment live in DataBrowserTypes.ts (the context
// needs the History type too); re-exported here for existing importers.
export { schemaHistory };
export type { History, HistoryEntry };

export const historyParams = {
    history: parseAsJson<History>(schemaHistory.parse).withDefault([]),
};

const serialize = createSerializer(historyParams);

const isPathPrefix = (path: string[], prefix: string[]) => path.length >= prefix.length && prefix.every((id, index) => path[index] === id);

/** The fixed root prefix of an entry — its identity together with `s`; absent `r` means 1. */
export const entryPrefix = (entry: HistoryEntry) => entry.p.slice(0, entry.r ?? 1);

/**
 * Whether a history entry belongs to the dialog identified by (scopeKey, rootPrefix).
 * Entries without a scope (legacy URLs, standalone data browser pages) match any scope.
 */
export const matchesEntry = (entry: HistoryEntry, scopeKey: string | undefined, rootPrefix: string[]) =>
    (entry.s === undefined || entry.s === scopeKey) && (entry.r ?? 1) === rootPrefix.length && isPathPrefix(entry.p, rootPrefix);

// Single source of truth for "what the history array becomes" — used by
// getHistoryHref (middle/ctrl-click, new tab) AND navigateToPath/setHistory
// (left-click, shallow). The two MUST stay byte-identical: the href is the
// new-tab fallback for exactly the update the onClick applies.
// A cell dialog can't show anything above its r-prefix, so navigating to a
// strict prefix of the root (a breadcrumb above the dialog's floor) closes
// this entry and hands the path to the scope's parent r=1 entry — rendered
// by the contribution's column-header dialog. Unscoped dialogs have no such
// owner, so their paths clamp to the root prefix instead.
// Scoped entries exist iff their dialog is open, so they persist (and can be
// created) at the bare root; only unscoped entries collapsing to the root
// are removed entirely.
export const computeUpdatedHistory = (prev: History, fullPath: string[], scopeKey: string | undefined, rootPrefix: string[]): History => {
    if (scopeKey !== undefined && rootPrefix.length > 1 && fullPath.length < rootPrefix.length && isPathPrefix(rootPrefix, fullPath)) {
        const withoutOwnEntry = prev.filter((entry) => !matchesEntry(entry, scopeKey, rootPrefix));
        return computeUpdatedHistory(withoutOwnEntry, fullPath, scopeKey, [rootPrefix[0]]);
    }
    const clampedPath = isPathPrefix(fullPath, rootPrefix) ? fullPath : rootPrefix;
    const updatedEntry: HistoryEntry = {
        ...(scopeKey !== undefined && { s: scopeKey }),
        p: clampedPath,
        ...(rootPrefix.length > 1 && { r: rootPrefix.length }),
    };
    const entryIndex = prev.findIndex((entry) => matchesEntry(entry, scopeKey, rootPrefix));
    const updated = [...prev];
    if (entryIndex !== -1) {
        if (scopeKey === undefined && rootPrefix.length === 1 && clampedPath.length <= 1) {
            updated.splice(entryIndex, 1);
        } else {
            updated[entryIndex] = updatedEntry;
        }
    } else if (scopeKey !== undefined || clampedPath.length > 1) {
        updated.push(updatedEntry);
    }
    return updated;
};

/**
 * Minimal href that opens the dialog identified by (scopeKey, prefix). Used by
 * subscription-free links (comparison cells / column headers): it encodes only
 * this dialog's entry, so it can be computed from props without subscribing to
 * the URL. Pair with refreshEntryOpenHref for full fidelity at click time.
 */
export const getEntryOpenHref = (prefix: string[], scopeKey?: string) =>
    serialize('?', { history: computeUpdatedHistory([], prefix, scopeKey, prefix) }) || '?';

/**
 * Upgrades a subscription-free link's href to full fidelity (current query
 * string + every other open dialog) just before the browser reads it. Call it
 * from onMouseDown: mousedown precedes both middle-click navigation and
 * right-click → "copy link address", so the href the browser consumes is
 * byte-identical to the update the left-click open applies.
 */
export const refreshEntryOpenHref = (anchor: HTMLAnchorElement, prefix: string[], scopeKey?: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    const raw = searchParams.get('history');
    const current = (raw === null ? null : historyParams.history.parse(raw)) ?? [];
    anchor.setAttribute('href', serialize(searchParams, { history: computeUpdatedHistory(current, prefix, scopeKey, prefix) }) || '?');
};

// Statement paths are seeded at the *currently viewed* entity (Body.tsx), so
// they are relative: newPath[0] equals the current (last) element of the
// history and the tail extends it. Anchoring on the last element — not an
// indexOf search — keeps cyclic graph paths intact ([A,p1,B,p2,A] must not
// re-anchor a click from the second A onto the first). Everything else
// (bare-root targets, unknown starts) passes through unchanged; breadcrumb
// targets never come through here — they navigate absolutely via setHistory
// and getAbsoluteHistoryHref.
export const expandPath = (currentHistory: string[], newPath: string[]): string[] =>
    newPath.length > 1 && newPath[0] === currentHistory[currentHistory.length - 1] ? [...currentHistory.slice(0, -1), ...newPath] : newPath;

export type UseHistoryParams = {
    /** Override the scope key from the DataBrowser config (for callers outside a DataBrowserProvider, e.g. comparison cells). */
    scopeKey?: string;
    /** Override the history prefix from the DataBrowser config (for callers outside a DataBrowserProvider, e.g. comparison cells). */
    historyPrefix?: string[];
};

/** Narrowed common setter over both storages: functional updater only (every
 *  internal write is an updater); nuqs Options are URL semantics and are
 *  ignored in local mode. */
type SetHistoryFn = (updater: (prev: History) => History, options?: Options) => void;

const useHistory = (params?: UseHistoryParams) => {
    const { rootId, config, localHistory } = useDataBrowserState();
    const dispatch = useDataBrowserDispatch();
    const searchParams = useSearchParams();

    const scopeKey = params?.scopeKey ?? config.scopeKey;
    const historyPrefix = params?.historyPrefix ?? config.historyPrefix;
    const rootPrefix = historyPrefix && historyPrefix.length > 0 ? historyPrefix : [rootId];

    // Scoped entries exist iff their dialog is open — semantics that only work
    // in the shared URL param, so a scope always forces URL storage. The flag
    // never comes through params, so outside-provider callers (comparison
    // Cell/ColumnHeader) can't end up local either.
    const isLocalHistory = scopeKey === undefined && config.historyStorage === 'local';

    // Both storages are instantiated unconditionally (rules of hooks); the flag
    // only selects which one is read and written.
    const [urlHistory, setUrlHistory] = useQueryState('history', historyParams.history.withOptions({ history: 'push' }));
    const history = isLocalHistory ? localHistory : urlHistory;
    const setHistory: SetHistoryFn = isLocalHistory ? (updater) => dispatch({ type: 'SET_LOCAL_HISTORY', payload: updater }) : setUrlHistory;

    const currentHistory = history.find((entry) => matchesEntry(entry, scopeKey, rootPrefix))?.p ?? rootPrefix;
    const currentId = currentHistory[currentHistory.length - 1] ?? rootId;

    const setCurrentHistory = (newHistory: string[], options?: Options) => {
        setHistory((prev) => computeUpdatedHistory(prev, newHistory, scopeKey, rootPrefix), options);
        dispatch({ type: 'SET_LOADED_RESOURCES', payload: {} });
    };

    // Shallow pushState via nuqs — updates the URL without Next.js router
    // navigation, so no RSC refetch of the page (~1.7s → ~0.4s, measured).
    // Link's own navigation is skipped by preventDefault in the callers.
    const navigateToPath = (newPath: string[], options?: Options) => setCurrentHistory(expandPath(currentHistory, newPath), options);

    // Returns null in local mode — there is no URL that owns the state, and
    // serializing a `history` param nothing renders would recreate the
    // orphaned-entry bug in new tabs. Callers fall back to entity-page hrefs.
    const buildHref = (fullPath: string[]): string | null =>
        isLocalHistory
            ? null
            : // '?' fallback: an empty href resolves to the current URL *including* its
              // query string, which would keep the history param the update just cleared
              serialize(searchParams, { history: computeUpdatedHistory(history, fullPath, scopeKey, rootPrefix) }) || '?';

    /** Href for relative statement paths (seeded at the current entity). */
    const getHistoryHref = (newPath: string[]) => buildHref(expandPath(currentHistory, newPath));

    /** Href for absolute paths already anchored at the dialog root (breadcrumbs). */
    const getAbsoluteHistoryHref = (newPath: string[]) => buildHref(newPath);

    const getPreviousId = (id: string) => {
        const index = currentHistory.indexOf(id);
        return index > 1 ? currentHistory[index - 2] : undefined;
    };

    // Navigating above the dialog's fixed root only works when a parent owns
    // the promoted r=1 entry — the comparison column header's dialog. Unscoped
    // dialogs have no owner, so their parent crumbs stay plain labels.
    const canNavigateAboveRoot = scopeKey !== undefined && rootPrefix.length > 1;

    return {
        currentId,
        history: currentHistory,
        rootPrefix,
        canNavigateAboveRoot,
        isLocalHistory,
        setHistory: setCurrentHistory,
        navigateToPath,
        getPreviousId,
        getHistoryHref,
        getAbsoluteHistoryHref,
    };
};

export default useHistory;
