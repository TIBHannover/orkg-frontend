'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import comparisonsThumbnail from 'assets/img/video_thumbnails/comparisons.png';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import useAuthentication from 'components/hooks/useAuthentication';
import ListPage from 'components/PaginatedContent/ListPage';
import VideoExplainer from 'components/PaginatedContent/VideoExplainer';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import VisibilityFilter from 'components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';
import { comparisonUrl, getComparisons } from 'services/backend/comparisons';
import { Comparison, VisibilityOptions } from 'services/backend/types';

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
            <RequireAuthentication
                component={Link}
                color="secondary"
                size="sm"
                className="btn btn-secondary btn-sm flex-shrink-0"
                href={ROUTES.CREATE_COMPARISON}
            >
                <FontAwesomeIcon icon={faPlus} /> Create comparison
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Link}
                    color="secondary"
                    size="sm"
                    className="btn btn-secondary btn-sm"
                    href={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-comparisons' })}
                    style={{ marginLeft: 1 }}
                >
                    Draft comparisons
                </RequireAuthentication>
            )}
        </>
    );

    const infoContainerText = (
        <div className="d-flex">
            <VideoExplainer
                previewStyle={{ width: 65, height: 35, background: `url(${comparisonsThumbnail.src})` }}
                video={
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/j4lVfO6GBZ8"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                }
            />
            <span>
                ORKG comparisons provide condensed overviews of the state-of-the-art for a particular research question.{' '}
                <a href="https://orkg.org/about/15/Comparisons" rel="noreferrer" target="_blank">
                    Visit the help center
                </a>{' '}
                or{' '}
                <a href="https://academy.orkg.org/orkg-academy/main/courses/comparison-course.html" rel="noreferrer" target="_blank">
                    learn more in the academy
                </a>
                .
            </span>
        </div>
    );

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
