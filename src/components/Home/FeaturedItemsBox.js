import { useState } from 'react';
import FeaturedItems from './FeaturedItems';
import styled from 'styled-components';
import { CLASSES } from 'constants/graphSettings';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { ResponsiveTabs } from './styled';
import Tabs from 'react-responsive-tabs';

const DEFAULT_CLASSES_FILTER = [
    {
        id: CLASSES.COMPARISON,
        label: 'Comparisons',
        tippyContent: 'Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic.'
    },
    { id: CLASSES.SMART_REVIEW, label: 'SmartReviews', tippyContent: false },
    { id: CLASSES.LITERATURE_LIST, label: 'Literature lists', tippyContent: false },
    { id: CLASSES.VISUALIZATION, label: 'Visualizations', tippyContent: false },
    { id: CLASSES.PAPER, label: 'Papers', tippyContent: false }
];

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const FeaturedItemsBox = ({ researchFieldId }) => {
    const [activeTab, setActiveState] = useState(0);
    const getTabs = () => {
        return DEFAULT_CLASSES_FILTER.map((featuredClass, index) => ({
            title: (
                <Tippy content={featuredClass.tippyContent} disabled={!featuredClass.tippyContent ? true : false}>
                    <div
                        role="button"
                        tabIndex="0"
                        onKeyDown={e => e.keyCode === 13 && setActiveState(index)}
                        className={`h6 mb-0 flex-grow-1 text-center tab ${activeTab === index ? 'active' : ''}`}
                        onClick={() => setActiveState(index)}
                    >
                        {featuredClass.label}
                    </div>
                </Tippy>
            ),
            getContent: () => <FeaturedItems researchFieldId={researchFieldId} label={featuredClass.label} classID={featuredClass.id} />,
            key: featuredClass.id,
            tabClassName: 'tab h6',
            panelClassName: 'panel'
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
    researchFieldId: PropTypes.string.isRequired
};

export default FeaturedItemsBox;
