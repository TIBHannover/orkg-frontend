import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { useParams, useNavigate } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import Tippy from '@tippyjs/react';
import FeaturedItems from 'components/Home/FeaturedItems';

// eslint-disable-next-line react/prop-types
function HomeTabsContainer({ researchFieldId, researchFieldLabel }) {
    console.log('researchFieldId', researchFieldId);
    console.log('researchFieldLabel', researchFieldLabel);
    const params = useParams();
    const { activeTab, id } = params;
    const navigate = useNavigate();
    const onTabChange = key => {
        navigate(
            `${reverse(ROUTES.HOME_TABS, {
                activeTab: key,
            })}`,
        );
    };
    const items = [
        {
            label: 'Comparisons',
            key: 'comparisons',
            children: (
                <Items
                    filterLabel="comparisons"
                    filterClass={CLASSES.COMPARISON}
                    id={id}
                    researchFieldLabel={researchFieldLabel}
                    researchFieldId={researchFieldId}
                    featuredClass="Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic."
                />
            ),
        },
        {
            label: 'Papers',
            key: 'papers',
            children: (
                <Items
                    filterLabel="papers"
                    filterClass={CLASSES.PAPER}
                    id={id}
                    researchFieldLabel={researchFieldLabel}
                    researchFieldId={researchFieldId}
                    featuredClass="Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic."
                />
            ),
            tippyContent: false,
        },
        {
            label: 'Visualizations',
            key: 'visualizations',
            children: (
                <Items
                    filterLabel="visualizations"
                    filterClass={CLASSES.VISUALIZATION}
                    id={id}
                    showDelete={false}
                    researchFieldLabel={researchFieldLabel}
                    researchFieldId={researchFieldId}
                    featuredClass="Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic."
                />
            ),
            tippyContent: false,
        },
        {
            label: 'Reviews',
            key: 'reviews',
            children: (
                <Items
                    filterLabel="reviews"
                    filterClass={CLASSES.SMART_REVIEW_PUBLISHED}
                    id={id}
                    showDelete={false}
                    researchFieldLabel={researchFieldLabel}
                    researchFieldId={researchFieldId}
                    featuredClass="Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic."
                />
            ),
            tippyContent: 'Reviews are dynamic, community maintained scholarly articles and are especially suitable for survey papers.',
        },
        {
            label: 'Lists',
            key: 'lists',
            children: (
                <Items
                    filterLabel="lists"
                    filterClass={CLASSES.LITERATURE_LIST_PUBLISHED}
                    id={id}
                    showDelete={false}
                    researchFieldLabel={researchFieldLabel}
                    researchFieldId={researchFieldId}
                    featuredClass="Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic."
                />
            ),
            tippyContent: 'Lists provide a way to organize and describe state-of-the-art literature for a specific research domain.',
        },
        {
            label: 'Templates',
            key: 'templates',
            children: (
                <Items
                    filterLabel="templates"
                    filterClass={CLASSES.NODE_SHAPE}
                    id={id}
                    showDelete={false}
                    researchFieldLabel={researchFieldLabel}
                    researchFieldId={researchFieldId}
                    featuredClass="Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic."
                />
            ),
            tippyContent: false,
        },
    ];

    // const DEFAULT_CLASSES_FILTER = [
    //     {
    //         id: CLASSES.COMPARISON,
    //         label: 'Comparisons',
    //         tippyContent: 'Comparisons in ORKG provide an overview of state-of-the-art literature for a particular topic.',
    //         link: reverse(ROUTES.COMPARISONS),
    //     },
    //     /*
    //     {
    //         id: CLASSES.SMART_REVIEW_PUBLISHED,
    //         label: 'Reviews',
    //         tippyContent: 'Reviews are dynamic, community maintained scholarly articles and are especially suitable for survey papers.',
    //         link: reverse(ROUTES.SMART_REVIEWS)
    //     },
    //     {
    //         id: CLASSES.LITERATURE_LIST_PUBLISHED,
    //         label: 'Lists',
    //         tippyContent: 'Lists provide a way to organize and describe state-of-the-art literature for a specific research domain.',
    //         link: reverse(ROUTES.LISTS)
    //     }, */
    //     { id: CLASSES.VISUALIZATION, label: 'Visualizations', tippyContent: false, link: reverse(ROUTES.VISUALIZATIONS) },
    //     { id: CLASSES.PAPER, label: 'Papers', tippyContent: false, link: reverse(ROUTES.PAPERS) },
    // ];
    return (
        <Tabs
            className="box rounded"
            getPopupContainer={trigger => trigger.parentNode}
            destroyInactiveTabPane={true}
            onChange={onTabChange}
            activeKey={activeTab ?? 'comparisons'}
            items={items}
            // features={items.map(featuredClass => ({
            //     title: (
            //         <Tippy content={featuredClass.tippyContent} disabled={!featuredClass.tippyContent}>
            //             <div className="text-center">{featuredClass.label}</div>
            //         </Tippy>
            //     ),
            //     getContent: () => (
            //         <FeaturedItems researchFieldLabel={researchFieldLabel} researchFieldId={researchFieldId} featuredClass={featuredClass} />
            //     ),
            // }))}
        />
    );
}

export default HomeTabsContainer;
