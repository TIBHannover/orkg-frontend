/* eslint-disable linebreak-style */
import { useState } from 'react';
import Tabs from 'rc-tabs';
import { GlobalStyle, StyledContributionTabs } from 'components/ContributionTabs/styled';
import { Container } from 'reactstrap';
import { CLASSES } from 'constants/graphSettings';
import Items from 'components/UserProfile/Items';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

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
            <GlobalStyle />
            <StyledContributionTabs disablePadding={true}>
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
            </StyledContributionTabs>
        </Container>
    );
}

TabsContainer.propTypes = {
    currentUserId: PropTypes.string.isRequired,
};

export default TabsContainer;
