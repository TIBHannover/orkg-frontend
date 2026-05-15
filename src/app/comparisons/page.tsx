'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';

import ComparisonInfoText from '@/app/comparisons/ComparisonInfoText';
import ComparisonCard from '@/components/Cards/ComparisonCard/ComparisonCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { comparisonUrl, getComparisons } from '@/services/backend/comparisons';
import { Comparison, VisibilityOptions } from '@/services/backend/types';

const Comparisons = () => {
    const { user } = useAuthentication();

    const [visibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue: VISIBILITY_FILTERS.ALL_LISTED,
        parse: (value) => value as VisibilityOptions,
    });

    useEffect(() => {
        document.title = 'Comparisons list - ORKG';
    });

    const renderListItem = (comparison: Comparison) => <ComparisonCard comparison={comparison} key={comparison.id} />;

    const buttons = (
        <>
            <VisibilityFilter />
            <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={ROUTES.CREATE_COMPARISON}>
                <FontAwesomeIcon icon={faPlus} /> Create comparison
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Button}
                    size="sm"
                    className="button--orkg-secondary"
                    href={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-comparisons' })}
                >
                    Draft comparisons
                </RequireAuthentication>
            )}
        </>
    );

    const infoContainerText = <ComparisonInfoText />;

    return (
        <ListPage
            label="comparisons"
            resourceClass={CLASSES.COMPARISON}
            fetchFunction={getComparisons}
            fetchUrl={comparisonUrl}
            fetchFunctionName="getComparisons"
            fetchExtraParams={{
                published: true,
                visibility,
            }}
            renderListItem={renderListItem}
            buttons={buttons}
            infoContainerText={infoContainerText}
        />
    );
};

export default Comparisons;
