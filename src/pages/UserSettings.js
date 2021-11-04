import TitleBar from 'components/TitleBar/TitleBar';
import DraftComparisons from 'components/UserSettings/DraftComparisons/DraftComparisons';
import DraftSmartReviews from 'components/UserSettings/DraftSmartReviews/DraftSmartReviews';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Container, Row } from 'reactstrap';
import styled from 'styled-components';
import GeneralSettings from '../components/UserSettings/GeneralSettings';
import Password from '../components/UserSettings/Password';

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
        text-decoration: none;
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
                    <div className="col-3 justify-content-center">
                        <Container className="box rounded p-3">
                            <StyledSettingsMenu>
                                <Link to={reverse(ROUTES.USER_SETTINGS, { tab: 'general' })} className={activeTab === 'general' ? 'active' : ''}>
                                    General settings
                                </Link>
                                <Link to={reverse(ROUTES.USER_SETTINGS, { tab: 'password' })} className={activeTab === 'password' ? 'active' : ''}>
                                    Password
                                </Link>
                                <hr />
                                <Link
                                    to={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-comparisons' })}
                                    className={activeTab === 'draft-comparisons' ? 'active' : ''}
                                >
                                    Draft comparisons
                                </Link>
                                <Link
                                    to={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-smart-reviews' })}
                                    className={activeTab === 'draft-smart-reviews' ? 'active' : ''}
                                >
                                    Draft SmartReviews
                                </Link>
                            </StyledSettingsMenu>
                        </Container>
                    </div>
                    <div className="col-9 justify-content-center">
                        {activeTab === 'general' && (
                            <div className="box rounded pt-4 pb-3 px-4">
                                <GeneralSettings />
                            </div>
                        )}
                        {activeTab === 'password' && (
                            <div className="box rounded pt-4 pb-3 px-4">
                                <Password />
                            </div>
                        )}

                        {activeTab === 'draft-comparisons' && <DraftComparisons />}

                        {activeTab === 'draft-smart-reviews' && <DraftSmartReviews />}
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default UserSettings;
