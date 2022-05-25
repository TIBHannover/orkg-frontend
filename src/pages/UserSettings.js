import TitleBar from 'components/TitleBar/TitleBar';
import DraftComparisons from 'components/UserSettings/DraftComparisons/DraftComparisons';
import DraftLists from 'components/UserSettings/DraftLists/DraftLists';
import DraftReviews from 'components/UserSettings/DraftReviews/DraftReviews';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row } from 'reactstrap';
import styled from 'styled-components';
import GeneralSettings from 'components/UserSettings/GeneralSettings';
import Password from 'components/UserSettings/Password';
import requireAuthentication from 'requireAuthentication';

export const StyledSettingsMenu = styled.div`
    padding: 0;
    padding-top: 15px;

    > a {
        display: block;
        padding: 9px 10px 9px 15px;
        margin-bottom: 5px;
        transition: 0.3s background;
        border-radius: ${props => props.theme.borderRadius};
        cursor: pointer;
        width: 100%;
        text-decoration: none !important;
        color: inherit;

        &.active,
        &:hover {
            background: ${props => props.theme.primary};
            color: #fff;
        }
        &.active a {
            color: #fff;
        }
    }
`;

const TABS = {
    GENERAL: 'general',
    PASSWORD: 'password',
    DRAFT_COMPARISONS: 'draft-comparisons',
    DRAFT_REVIEWS: 'draft-reviews',
    DRAFT_LISTS: 'draft-lists',
};

const UserSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const { tab } = useParams();

    useEffect(() => {
        setActiveTab(tab || 'general');
    }, [tab]);

    return (
        <>
            <TitleBar>My account</TitleBar>
            <Container className="p-0">
                <Row>
                    <div className="col-md-3 mb-sm-2 justify-content-center">
                        <Container className="box rounded p-3">
                            <StyledSettingsMenu>
                                <Link
                                    to={reverse(ROUTES.USER_SETTINGS, { tab: TABS.GENERAL })}
                                    className={activeTab === TABS.GENERAL ? 'active' : ''}
                                >
                                    General settings
                                </Link>
                                <Link
                                    to={reverse(ROUTES.USER_SETTINGS, { tab: TABS.PASSWORD })}
                                    className={activeTab === TABS.PASSWORD ? 'active' : ''}
                                >
                                    Password
                                </Link>
                                <hr />
                                <Link
                                    to={reverse(ROUTES.USER_SETTINGS, { tab: TABS.DRAFT_COMPARISONS })}
                                    className={activeTab === TABS.DRAFT_COMPARISONS ? 'active' : ''}
                                >
                                    Draft comparisons
                                </Link>
                                <Link
                                    to={reverse(ROUTES.USER_SETTINGS, { tab: TABS.DRAFT_REVIEWS })}
                                    className={activeTab === TABS.DRAFT_REVIEWS ? 'active' : ''}
                                >
                                    Draft reviews
                                </Link>
                                <Link
                                    to={reverse(ROUTES.USER_SETTINGS, { tab: TABS.DRAFT_LISTS })}
                                    className={activeTab === TABS.DRAFT_LISTS ? 'active' : ''}
                                >
                                    Draft lists
                                </Link>
                            </StyledSettingsMenu>
                        </Container>
                    </div>
                    <div className="col-md-9 justify-content-center">
                        {activeTab === TABS.GENERAL && (
                            <div className="box rounded pt-4 pb-3 px-4">
                                <GeneralSettings />
                            </div>
                        )}
                        {activeTab === TABS.PASSWORD && (
                            <div className="box rounded pt-4 pb-3 px-4">
                                <Password />
                            </div>
                        )}

                        {activeTab === TABS.DRAFT_COMPARISONS && <DraftComparisons />}

                        {activeTab === TABS.DRAFT_REVIEWS && <DraftReviews />}

                        {activeTab === TABS.DRAFT_LISTS && <DraftLists />}
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default requireAuthentication(UserSettings);
