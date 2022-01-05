import FeaturedItems from './FeaturedItems';
import styled from 'styled-components';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { ResponsiveTabs } from './styled';
import { reverse } from 'named-urls';
import Tabs from 'react-responsive-tabs';

const DEFAULT_CLASSES_FILTER = [
    {
        id: CLASSES.COMPARISON,
        label: 'Comparisons',
        tippyContent: 'Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic.',
        link: reverse(ROUTES.COMPARISONS)
    },
    {
        id: CLASSES.SMART_REVIEW_PUBLISHED,
        label: 'SmartReviews',
        tippyContent: 'SmartReviews are dynamic, community maintained scholarly articles and are especially suitable for survey papers.',
        link: reverse(ROUTES.SMART_REVIEWS)
    },
    {
        id: CLASSES.LITERATURE_LIST_PUBLISHED,
        label: 'Literature lists',
        tippyContent: 'Literature lists provide a way to organize and describe state-of-the-art literature for a specific research domain.',
        link: reverse(ROUTES.LITERATURE_LISTS)
    },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations', tippyContent: false, link: reverse(ROUTES.VISUALIZATIONS) },
    { id: CLASSES.PAPER, label: 'Papers', tippyContent: false, link: reverse(ROUTES.PAPERS) }
];

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const FeaturedItemsBox = ({ researchFieldId, researchFieldLabel }) => {
    const getTabs = () => {
        return DEFAULT_CLASSES_FILTER.map(featuredClass => ({
            title: (
                <Tippy content={featuredClass.tippyContent} disabled={!featuredClass.tippyContent ? true : false}>
                    <div className="text-center">{featuredClass.label}</div>
                </Tippy>
            ),
            getContent: () => (
                <FeaturedItems researchFieldLabel={researchFieldLabel} researchFieldId={researchFieldId} featuredClass={featuredClass} />
            ),
            key: featuredClass.id,
            tabClassName: 'tab h6'
        }));
    };

    return (
        <SidebarStyledBox className="box rounded-3 mt-3">
            <ResponsiveTabs>
                <Tabs items={getTabs()} />
            </ResponsiveTabs>
        </SidebarStyledBox>
    );
};

FeaturedItemsBox.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    researchFieldLabel: PropTypes.string.isRequired
};

export default FeaturedItemsBox;
