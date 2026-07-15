import { useQueryState } from 'nuqs';
import { FC, useEffect } from 'react';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import useComparison from '@/components/Comparison/hooks/useComparison';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { computeUpdatedHistory, entryPrefix, historyParams, matchesEntry } from '@/components/DataBrowser/hooks/useHistory';

type ComparisonDialogProps = {
    /** The dialog's fixed root prefix (its identity); the last element is the entity it is rooted at. */
    historyPrefix: string[];
    onClose: () => void;
};

const ComparisonDialog: FC<ComparisonDialogProps> = ({ historyPrefix, onClose }) => {
    const { scopeKey } = useComparisonState();
    const { selectedPathsFlattened, comparisonContents, mutateComparisonContents, isEditMode } = useComparison();

    const rootId = historyPrefix[historyPrefix.length - 1];

    return (
        <DataBrowserDialog
            show
            toggleModal={() => {
                if (isEditMode) mutateComparisonContents(comparisonContents, { revalidate: true });
                onClose();
            }}
            id={rootId}
            comparisonSelectedPaths={selectedPathsFlattened.map((selectedPath) => [...(selectedPath.path ?? []), selectedPath.id])}
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
