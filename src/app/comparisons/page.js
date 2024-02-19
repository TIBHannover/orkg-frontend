'use client';

import Link from 'components/NextJsMigration/Link';
import { useEffect } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { find } from 'lodash';
import { getResources } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getComparisonData, groupVersionsOfComparisons } from 'utils';
import comparisonsThumbnail from 'assets/img/video_thumbnails/comparisons.png';
import VideoExplainer from 'components/ListPage/VideoExplainer';
import loadImage from 'components/NextJsMigration/loadImage';

const Comparisons = () => {
    useEffect(() => {
        document.title = 'Comparisons list - ORKG';
    });

    const renderListItem = comparison => <ComparisonCard comparison={comparison} key={`pc${comparison.id}`} />;

    const fetchItems = async ({ page, pageSize }) => {
        const { items, last, totalElements } = await getResources({
            include: [CLASSES.COMPARISON],
            page,
            size: pageSize,
            sortBy: 'created_at',
            desc: true,
        }).then(async result => ({
            ...result,
            items: groupVersionsOfComparisons(
                await getStatementsBySubjects({ ids: result.content.map(p => p.id) }).then(comparisonsStatements =>
                    comparisonsStatements.map(comparisonStatements =>
                        getComparisonData(find(result.content, { id: comparisonStatements.id }), comparisonStatements.statements),
                    ),
                ),
            ),
        }));

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
                previewStyle={{ width: 65, height: 35, background: `url(${loadImage(comparisonsThumbnail)})` }}
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
            buttons={buttons}
            pageSize={15}
            infoContainerText={infoContainerText}
        />
    );
};

export default Comparisons;
