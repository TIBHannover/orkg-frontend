'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import comparisonsThumbnail from 'assets/img/video_thumbnails/comparisons.png';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import ListPage from 'components/ListPage/ListPage';
import VideoExplainer from 'components/ListPage/VideoExplainer';
import Link from 'next/link';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { useEffect } from 'react';
import { getComparisons } from 'services/backend/comparisons';
import { Comparison } from 'services/backend/types';

const Comparisons = () => {
    useEffect(() => {
        document.title = 'Comparisons list - ORKG';
    });

    const renderListItem = (comparison: Comparison) => <ComparisonCard comparison={comparison} key={comparison.id} />;

    const fetchItems = async ({ page, pageSize }: { page: number; pageSize: number }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getComparisons({
            page,
            size: pageSize,
            sortBy: [{ property: 'created_at', direction: 'desc' }],
        });

        return {
            items,
            last,
            totalElements,
        };
    };

    const buttons = (
        <>
            <RequireAuthentication
                component={Link}
                color="secondary"
                size="sm"
                className="btn btn-secondary btn-sm flex-shrink-0"
                href={ROUTES.ADD_COMPARISON}
            >
                <Icon icon={faPlus} /> Create comparison
            </RequireAuthentication>
            <Link style={{ marginLeft: '1px' }} className="btn btn-secondary btn-sm flex-shrink-0" href={ROUTES.FEATURED_COMPARISONS}>
                Featured comparisons
            </Link>
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
                    Learn more in the help center
                </a>
                .
            </span>
        </div>
    );

    return (
        <ListPage
            label="comparisons"
            resourceClass={CLASSES.COMPARISON}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            // @ts-expect-error
            buttons={buttons}
            pageSize={15}
            // @ts-expect-error
            infoContainerText={infoContainerText}
        />
    );
};

export default Comparisons;
