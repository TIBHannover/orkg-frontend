import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from '@heroui/react';
import { useEffect } from 'react';
import { mutate } from 'swr';

import EntityCard from '@/components/Cards/EntityCard/EntityCard';
import Confirm from '@/components/Confirmation/Confirmation';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { comparisonUrl, deleteComparison, GetComparisonParams, getComparisons } from '@/services/backend/comparisons';
import { Comparison, PaginatedResponse } from '@/services/backend/types';

const getDraftComparisons = async (params: GetComparisonParams): Promise<PaginatedResponse<Comparison>> => {
    const response = await getComparisons(params);
    return {
        ...response,
        content: response.content.filter((c) => c.versions.published.length === 0),
    };
};

const DraftComparisons = () => {
    const { user } = useAuthentication();

    useEffect(() => {
        document.title = 'Draft comparisons - ORKG';
    });

    const handleDelete = async (comparison: Comparison) => {
        const confirmed = await Confirm({
            title: 'Delete draft comparison?',
            message: `Are you sure you want to delete the draft comparison "${comparison.title}"? This action cannot be undone.`,
            proceedLabel: 'Delete',
        });
        if (confirmed) {
            try {
                await deleteComparison(comparison.id);
                mutate((key: unknown) => Array.isArray(key) && key[key.length - 1] === 'getDraftComparisons');
                toast.success('Draft comparison deleted successfully');
            } catch {
                toast.danger('An error occurred while deleting the draft comparison');
            }
        }
    };

    const renderListItem = (comparison: Comparison) => (
        <EntityCard
            key={comparison.id}
            item={comparison}
            label={comparison.title}
            href={reverse(ROUTES.COMPARISON, { comparisonId: comparison.id })}
            showCreatedBy={false}
            menuActions={[{ key: 'delete', label: 'Delete', icon: faTrash, isDanger: true, onAction: () => handleDelete(comparison) }]}
        />
    );

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className="mb-5 px-3">
                <h2 className="text-xl mb-2">View draft comparisons</h2>
                <p className="leading-relaxed rounded bg-surface-tertiary p-4">
                    When you start working on a comparison and it is not yet published, it is a <em>draft comparison</em>. These are listed below. As
                    soon as you publish a comparison, it becomes publicly listed and is removed from this page.
                </p>
            </div>
            <ListPage
                label="draft comparison"
                resourceClass={CLASSES.COMPARISON}
                renderListItem={renderListItem}
                fetchFunction={getDraftComparisons}
                fetchFunctionName="getDraftComparisons"
                fetchUrl={comparisonUrl}
                fetchExtraParams={{ created_by: user.id, published: false }}
                disableSearch
                hideTitleBar
            />
        </div>
    );
};

export default DraftComparisons;
