import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

function TabsContainer({ currentUserId }) {
    const params = useParams();

    const { userId } = params;

    const [isActiveTab, setIsActiveTab] = useState('1');

    const onTabChange = key => {
        if (isActiveTab !== key) {
            setIsActiveTab(key);
        }
    };

    return (
        <Tabs
            className="box rounded"
            destroyInactiveTabPane={true}
            onChange={onTabChange}
            activeKey={isActiveTab ?? '1'}
            items={[
                {
                    label: 'Comparisons',
                    key: '1',
                    children: <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} userId={userId} />,
                },

                {
                    label: 'Papers',
                    key: '2',
                    children: <Items filterLabel="papers" filterClass={CLASSES.PAPER} userId={userId} showDelete={userId === currentUserId} />,
                },
                {
                    label: 'Reviews',
                    key: '3',
                    children: <Items filterLabel="reviews" filterClass={CLASSES.SMART_REVIEW_PUBLISHED} userId={userId} showDelete={false} />,
                },
                {
                    label: 'Templates',
                    key: '4',
                    children: <Items filterLabel="templates" filterClass={CLASSES.TEMPLATE} userId={userId} showDelete={false} />,
                },
            ]}
        />
    );
}

TabsContainer.propTypes = {
    currentUserId: PropTypes.string,
};

export default TabsContainer;
