import { ReactNode } from 'react';
import { z } from 'zod';

import { Statement } from '@/services/backend/types';

/**
 * URL state for open DataBrowser dialogs (`history` search param).
 * One entry per open dialog. Example on a review page:
 *   ?history=[{"s":"Sec1","p":["C1","P32","R5","P7","R9"],"r":3}]
 *   → the dialog opened from the cell [C1,P32,R5] in review section Sec1,
 *     then navigated inside the dialog via P7 to R9.
 *
 * s — scope/instance key: which embed owns the entry (comparison id on
 *     /comparisons/[id], section id for comparisons embedded in reviews).
 *     Opaque — compared for equality only, never part of the graph path.
 *     Absent on legacy URLs and standalone data browser pages.
 * p — graph path of alternating entity/predicate ids, from the cell root
 *     (contribution) down to the resource currently shown. In-dialog
 *     navigation rewrites the tail of this same entry.
 * r — length of the fixed root prefix of p (the cell path; 1 or absent for
 *     standalone data browsers). Entry identity is (s, p.slice(0, r)) —
 *     this distinguishes a cell entry [C1,P,R] (r=3) from a contribution
 *     dialog navigated to the same path (r=1), and nested sub-row cells
 *     whose paths extend their parent's.
 *
 * A scoped entry exists exactly while its dialog is open — a scoped r=1
 * entry with p = [C1] is the contribution's column-header dialog sitting at
 * its root. Unscoped entries only track navigation of an always-visible
 * browser (standalone pages, local-state dialogs) and are dropped when it
 * returns to its root.
 *
 * Field names are single letters to keep shareable URLs short.
 */
const schemaHistoryEntry = z.object({
    s: z.string().optional(),
    p: z.array(z.string()),
    r: z.number().int().positive().optional(),
});

// Entries are validated individually so one malformed entry (e.g. a truncated
// shared link) drops only itself, not every open dialog — nuqs falls back to
// the default [] whenever this schema throws, which now only happens when the
// param as a whole isn't a JSON array.
export const schemaHistory = z.array(z.unknown()).transform((entries) =>
    entries.flatMap((entry) => {
        const result = schemaHistoryEntry.safeParse(entry);
        return result.success ? [result.data] : [];
    }),
);

export type HistoryEntry = z.infer<typeof schemaHistoryEntry>;

export type History = HistoryEntry[];

export type DataBrowserConfig = {
    /**
     * Determines if the DataBrowser is in edit mode.
     */
    isEditMode?: boolean;
    /**
     * Fixed root prefix of this browser's history entry, e.g. the comparison
     * cell path [contributionId, predicateId, resourceId]. The dialog cannot
     * navigate above it; its length is persisted as `r` in the URL entry.
     * Leave unset for standalone browsers rooted at a single entity.
     */
    historyPrefix?: string[];
    /**
     * Scope/instance key persisted as `s` in the URL history entry, so that
     * multiple embedded data browsers on one page (e.g. comparisons in a
     * review) keep independent dialog state. Leave unset for standalone pages.
     */
    scopeKey?: string;
    /**
     * Where navigation history lives — the rule is "history lives where the
     * browser's open-state lives":
     * 'url' — shared `history` search param: shareable, restored on reload,
     *         browser Back steps through navigation. Default for embedded
     *         (always-visible) browsers.
     * 'local' — provider-local state: dies when the browser unmounts, browser
     *         Back does not step navigation. Default for DataBrowserDialog,
     *         whose open-state is local — URL entries it wrote could never
     *         reopen it and would be orphaned in shareable URLs.
     * Ignored when `scopeKey` is set: scoped entries rely on
     * "presence in the URL = dialog open", so a scope always forces 'url'.
     */
    historyStorage?: 'url' | 'local';
    /**
     * Determines if values should be opened in a dialog.
     */
    openValuesInDialog?: boolean;
    /**
     * Determines if properties should be displayed as links.
     * if false the link appears in black font color and opens in a new window
     */
    propertiesAsLinks?: boolean;
    /**
     * Determines if values should be displayed as links.
     */
    valuesAsLinks?: boolean;
    /**
     * Determines if editing is allowed at the shared root level.
     * If false in the paper view and the contribution is used in a comparison (which makes shared property >2),
     * it will prevent edit mode.
     */
    canEditSharedRootLevel?: boolean;
    /**
     * Determines if external descriptions should be shown.
     */
    showExternalDescriptions?: boolean;
    /**
     * Determines if the header should be shown.
     */
    showHeader?: boolean;
    /**
     * Determines if the footer should be shown.
     */
    showFooter?: boolean;
    /**
     * An array of class IDs representing the classes to be collapsed.
     */
    collapsedClasses?: string[];
    /**
     * An array of statements representing the statements snapshot.
     */
    statementsSnapshot?: Statement[];
    /**
     * The created_at timestamp of the statements snapshot.
     */
    snapshotCreatedAt?: string;
    /**
     * Paths selected in the comparison view, used to show predicates for non-existing values in the data browser.
     */
    comparisonSelectedPaths?: string[][];
};

export type DataBrowserPreferences = {
    /**
     * If true, data types will be shown inline with the values.
     */
    showInlineDataTypes: boolean;
    /**
     * If true, values will be expanded by default.
     */
    expandValuesByDefault: boolean;
};

/**
 * The context for the DataBrowser is used to pass the research field, title and abstract to the nlp service to get recommendations.
 */
export type DataBrowserResourceContext = {
    /**
     * The research field associated with the paper being browsed.
     */
    researchField?: string;
    /**
     * The title of the paper being browsed.
     */
    title?: string;
    /**
     * The abstract of the paper being browsed.
     */
    abstract?: string;
};

export type DataBrowserProps = {
    /**
     * The ID of the root resource to be browsed (the current resource will be taken from the URL).
     */
    id: string;
    /**
     * Rendered inside the DataBrowserProvider, above the browser header — lets
     * dialogs inject a context-aware heading that follows navigation (see DialogHeader).
     */
    renderAboveHeader?: () => ReactNode;
} & DataBrowserConfig &
    DataBrowserResourceContext;

export type ColType = {
    id: string;
    label: string;
    number?: number;
};

// The id is the column id
export type TableRow = Record<string, { id: string; value: string; _class: string; datatype: string }>;
