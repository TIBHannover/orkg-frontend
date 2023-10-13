import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import propTypes from 'prop-types';

function HomeTabsContainer({ researchFieldId, researchFieldLabel }) {
    const params = useParams();

    const { activeTab, id, slug } = params;
    const navigate = useNavigate();

    const onTabChange = key => {
        if (researchFieldId && slug) {
            navigate(
                `${`${reverse(ROUTES.HOME_TABS_WITH_RESEARCH_FIELD, {
                    researchFieldId,
                    slug,
                    activeTab: key,
                })}`}`,
            );
        } else {
            navigate(
                `${`${reverse(ROUTES.HOME_TABS, {
                    activeTab: key,
                })}`}`,
            );
        }
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
                />
            ),
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
                />
            ),
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
                />
            ),
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
                />
            ),
        },
    ];

    return (
        <Tabs
            className="box rounded"
            getPopupContainer={trigger => trigger.parentNode}
            destroyInactiveTabPane={true}
            onChange={onTabChange}
            activeKey={activeTab ?? 'comparisons'}
            items={items}
        />
    );
}

HomeTabsContainer.propTypes = {
    researchFieldLabel: propTypes.string,
    researchFieldId: propTypes.string,
};

export default HomeTabsContainer;
