import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import { useParams, useNavigate } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

function TabsContainer({ currentUserId, userId }) {
    const params = useParams();
    const { activeTab } = params;
    const navigate = useNavigate();
    const onTabChange = key => {
        navigate(
            `${reverse(ROUTES.USER_PROFILE_TABS, {
                userId,
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
                    children: <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} userId={userId} />,
                },

                {
                    label: 'Papers',
                    key: 'papers',
                    children: <Items filterLabel="papers" filterClass={CLASSES.PAPER} userId={userId} showDelete={userId === currentUserId} />,
                },
                {
                    label: 'Reviews',
                    key: 'reviews',
                    children: <Items filterLabel="reviews" filterClass={CLASSES.SMART_REVIEW_PUBLISHED} userId={userId} showDelete={false} />,
                },
                {
                    label: 'Templates',
                    key: 'templates',
                    children: <Items filterLabel="templates" filterClass={CLASSES.TEMPLATE} userId={userId} showDelete={false} />,
                },
            ]}
        />
    );
}

TabsContainer.propTypes = {
    currentUserId: PropTypes.string,
    userId: PropTypes.string,
};

export default TabsContainer;
