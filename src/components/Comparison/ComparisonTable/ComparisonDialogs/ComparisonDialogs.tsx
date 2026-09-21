import { useQueryState } from 'nuqs';
import { FC, useEffect } from 'react';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import enqueueToggle from '@/components/Comparison/ComparisonTable/ComparisonDialogs/toggleQueue';
import useComparison from '@/components/Comparison/hooks/useComparison';
import { deselectPath, SelectablePath, selectPath, toSelectableTree, toUpdatePaths } from '@/components/Comparison/utils/pathTree';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { computeUpdatedHistory, entryPrefix, historyParams, matchesEntry } from '@/components/DataBrowser/hooks/useHistory';
import errorHandler from '@/helpers/errorHandler';
import { getComparisonContents, updateComparisonContents } from '@/services/backend/comparisons';
import { ComparisonContents } from '@/services/backend/types';

// Hardcodes type: 'PREDICATE' — safe because callers only toggle level-0 rows in TriplePredicate
// (statement.predicate is a real Predicate). Revisit if Rosetta Stone rows ever expose the toggle.
const createPredicateNode = (id: string): SelectablePath => ({ id, type: 'PREDICATE', isSelected: true, children: [] });

type ComparisonDialogProps = {
    /** The dialog's fixed root prefix (its identity); the last element is the entity it is rooted at. */
    historyPrefix: string[];
    onClose: () => void;
};

const ComparisonDialog: FC<ComparisonDialogProps> = ({ historyPrefix, onClose }) => {
    const { scopeKey } = useComparisonState();
    const { comparison, selectedPathsFlattened, comparisonContents, mutateComparisonContents, isEditMode } = useComparison();

    const rootId = historyPrefix[historyPrefix.length - 1];

    const comparisonId = comparison?.id;
    const comparisonSelectedPaths = selectedPathsFlattened.map((selectedPath) => [...(selectedPath.path ?? []), selectedPath.id]);
    const handleToggleComparisonPropertyVisibility = async (predicatePath: string[], show: boolean) => {
        if (!comparisonId) {
            return;
        }
        await enqueueToggle(comparisonId, async () => {
            await mutateComparisonContents(
                async (current: ComparisonContents | undefined) => {
                    const base = current ?? (await getComparisonContents(comparisonId));
                    const currentPaths = toSelectableTree(base.selectedPaths);
                    const updatedPaths = toUpdatePaths(
                        show ? selectPath(currentPaths, predicatePath, createPredicateNode) : deselectPath(currentPaths, predicatePath),
                    );
                    try {
                        await updateComparisonContents({ id: comparisonId, selectedPaths: updatedPaths });
                    } catch (error) {
                        await errorHandler({ error, shouldShowToast: true });
                    }
                    return undefined;
                },
                // `revalidate: true` here would fire the refetch without awaiting it, so the next
                // queued toggle would still read the pre-PUT cache and overwrite this change.
                { revalidate: false, populateCache: false },
            );
            // Bare mutate() resolves only once the refetch has landed, so the next queued
            // toggle (and the caller's loading state) sees the updated selected_paths.
            await mutateComparisonContents();
        });
    };

    return (
        <DataBrowserDialog
            show
            toggleModal={() => {
                if (isEditMode) mutateComparisonContents(comparisonContents, { revalidate: true });
                onClose();
            }}
            id={rootId}
            comparisonSelectedPaths={comparisonSelectedPaths}
            onToggleComparisonPropertyVisibility={handleToggleComparisonPropertyVisibility}
            isEditMode={isEditMode}
            historyPrefix={historyPrefix}
            scopeKey={scopeKey}
        />
    );
};

/**
 * The single owner of this comparison scope's DataBrowser dialogs: renders one
 * dialog per URL `history` entry belonging to the scope. Cells and column
 * headers are subscription-free links (they open dialogs via the context's
 * openDialogEntry), so this is the only component in the table subscribed to
 * the `history` param — in-dialog navigation re-renders the open dialog, not
 * hundreds of cells. A dialog renders for every owned entry even when its cell
 * is filtered out of the visible table, so shared URLs always restore.
 */
const ComparisonDialogs = () => {
    const { scopeKey, registerDialogOpener } = useComparisonState();
    const [history, setHistory] = useQueryState('history', historyParams.history);

    useEffect(() => {
        registerDialogOpener((prefix) => setHistory((prev) => computeUpdatedHistory(prev, prefix, scopeKey, prefix), { history: 'push' }));
    }, [registerDialogOpener, setHistory, scopeKey]);

    // Strict scope match: unscoped entries belong to always-visible browsers
    // (standalone pages, review sections) — matching them leniently here would
    // open duplicate dialogs in every embedded comparison on the page.
    const ownEntries = history.filter((entry) => entry.s === scopeKey);

    return (
        <>
            {ownEntries.map((entry) => {
                const prefix = entryPrefix(entry);
                return (
                    <ComparisonDialog
                        key={prefix.join('/')}
                        historyPrefix={prefix}
                        // default `history: 'replace'` — Back from a closed dialog shouldn't reopen it
                        onClose={() => setHistory((prev) => prev.filter((other) => !matchesEntry(other, scopeKey, prefix)))}
                    />
                );
            })}
        </>
    );
};

export default ComparisonDialogs;
