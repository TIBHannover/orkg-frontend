/* eslint-disable linebreak-style */
import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from 'reactstrap';

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
        <Container className="mt-2 p-0">
            <Tabs
                destroyInactiveTabPane={true}
                onChange={onTabChange}
                activeKey={isActiveTab ?? '1'}
                items={[
                    {
                        label: 'Comparisons',
                        key: '1',
                        children: (
                            <Container className="p-0">
                                <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} userId={userId} />
                            </Container>
                        ),
                    },

                    {
                        label: 'Papers',
                        key: '2',
                        children: (
                            <Container className="p-0">
                                <Items filterLabel="papers" filterClass={CLASSES.PAPER} userId={userId} showDelete={userId === currentUserId} />
                            </Container>
                        ),
                    },
                    {
                        label: 'Templates',
                        key: '3',
                        children: (
                            <Container className="p-0">
                                <Items filterLabel="templates" filterClass={CLASSES.TEMPLATE} userId={userId} showDelete={false} />
                            </Container>
                        ),
                    },

                    {
                        label: 'Reviews',
                        key: '4',

                        children: (
                            <Container className="p-0">
                                <Items filterLabel="reviews" filterClass={CLASSES.SMART_REVIEW_PUBLISHED} userId={userId} showDelete={false} />
                            </Container>
                        ),
                    },
                ]}
            />
        </Container>
    );
}

TabsContainer.propTypes = {
    currentUserId: PropTypes.string,
};

export default TabsContainer;
