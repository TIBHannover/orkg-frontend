import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { useParams, useNavigate } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

function HomeTabsContainer() {
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

    return (
        <Tabs
            className="box rounded"
            getPopupContainer={trigger => trigger.parentNode}
            destroyInactiveTabPane={true}
            onChange={onTabChange}
            activeKey={activeTab ?? 'comparisons'}
            items={[
                {
                    label: 'Comparisons',
                    key: 'comparisons',
                    children: <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} id={id} />,
                },

                {
                    label: 'Papers',
                    key: 'papers',
                    children: <Items filterLabel="papers" filterClass={CLASSES.PAPER} id={id} />,
                },
                {
                    label: 'Visualizations',
                    key: 'visualizations',
                    children: <Items filterLabel="visualizations" filterClass={CLASSES.VISUALIZATION} id={id} showDelete={false} />,
                },
                {
                    label: 'Reviews',
                    key: 'reviews',
                    children: <Items filterLabel="reviews" filterClass={CLASSES.SMART_REVIEW_PUBLISHED} id={id} showDelete={false} />,
                },
                {
                    label: 'Lists',
                    key: 'lists',
                    children: <Items filterLabel="lists" filterClass={CLASSES.LITERATURE_LIST_PUBLISHED} id={id} showDelete={false} />,
                },
                {
                    label: 'Templates',
                    key: 'templates',
                    children: <Items filterLabel="templates" filterClass={CLASSES.NODE_SHAPE} id={id} showDelete={false} />,
                },
            ]}
        />
    );
}

export default HomeTabsContainer;
