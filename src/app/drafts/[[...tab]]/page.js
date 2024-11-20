'use client';

import TitleBar from 'components/TitleBar/TitleBar';
import useParams from 'components/useParams/useParams';
import DraftComparisons from 'components/UserSettings/DraftComparisons/DraftComparisons';
import DraftLists from 'components/UserSettings/DraftLists/DraftLists';
import DraftReviews from 'components/UserSettings/DraftReviews/DraftReviews';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container, Row } from 'reactstrap';
import requireAuthentication from 'requireAuthentication';
import styled from 'styled-components';

const StyledSettingsMenu = styled.div`
    padding: 0;
    padding-top: 15px;

    > a {
        display: block;
        padding: 9px 10px 9px 15px;
        margin-bottom: 5px;
        transition: 0.3s background;
        border-radius: ${(props) => props.theme.borderRadius};
        cursor: pointer;
        width: 100%;
        text-decoration: none !important;
        color: inherit;

        &.active,
        &:hover {
            background: ${(props) => props.theme.primary};
            color: #fff;
        }
        &.active a {
            color: #fff;
        }
    }
`;

const TABS = {
    DRAFT_COMPARISONS: 'draft-comparisons',
    DRAFT_REVIEWS: 'draft-reviews',
    DRAFT_LISTS: 'draft-lists',
};

const UserSettings = () => {
    const [activeTab, setActiveTab] = useState('draft-comparisons');
    const { tab } = useParams();

    useEffect(() => {
        setActiveTab(tab || 'draft-comparisons');
    }, [tab]);

    return (
        <>
            <TitleBar>My drafts</TitleBar>
            <Container className="p-0">
                <Row>
                    <div className="col-md-3 mb-sm-2 justify-content-center">
                        <Container className="box rounded p-3">
                            <StyledSettingsMenu>
                                <Link
                                    href={reverse(ROUTES.USER_SETTINGS, { tab: TABS.DRAFT_COMPARISONS })}
                                    className={activeTab === TABS.DRAFT_COMPARISONS ? 'active' : ''}
                                >
                                    Draft comparisons
                                </Link>
                                <Link
                                    href={reverse(ROUTES.USER_SETTINGS, { tab: TABS.DRAFT_REVIEWS })}
                                    className={activeTab === TABS.DRAFT_REVIEWS ? 'active' : ''}
                                >
                                    Draft reviews
                                </Link>
                                <Link
                                    href={reverse(ROUTES.USER_SETTINGS, { tab: TABS.DRAFT_LISTS })}
                                    className={activeTab === TABS.DRAFT_LISTS ? 'active' : ''}
                                >
                                    Draft lists
                                </Link>
                            </StyledSettingsMenu>
                        </Container>
                    </div>
                    <div className="col-md-9 justify-content-center">
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
