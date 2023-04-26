import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ObservatoryCard from 'components/Cards/ObservatoryCard/ObservatoryCard';
import TitleBar from 'components/TitleBar/TitleBar';
import { groupBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Col, Container, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { getAllObservatories } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { getObservatoriesStats } from 'services/backend/stats';
import styled from 'styled-components';

const TabPaneStyled = styled(TabPane)`
    border-top: 0;
`;

export const StyledResearchFieldWrapper = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border: ${props => props.theme.borderWidth} solid ${props => props.theme.primary};
    padding: 15px 30px;
`;

export const StyledResearchFieldList = styled.ul`
    list-style: none;
    padding: 0;
    padding-top: 15px;
`;

const StyledResearchFieldItem = styled(NavLink)`
    padding: 12px 10px 12px 15px;
    margin-bottom: 5px;
    transition: 0.3s background;
    border-top-left-radius: ${props => props.theme.borderRadius};
    border-bottom-left-radius: ${props => props.theme.borderRadius};
    border: 1px solid ${props => props.theme.lightDarker};
    background-color: ${props => props.theme.lightLighter};
    color: inherit;

    cursor: pointer !important;

    > span {
        cursor: pointer;
    }

    &.active {
        background: ${props => props.theme.primary};
        color: #fff;
        cursor: initial !important;
        border-color: ${props => props.theme.primary};
    }
`;

const Observatories = () => {
    const [observatories, setObservatories] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [failedLoading, setFailedLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const location = useLocation();

    const updateActiveTab = useCallback(() => {
        const { hash } = location;

        if (!hash) {
            return;
        }

        const _activeTab = hash.replace('#', '');

        setActiveTab(parseInt(_activeTab, 10));
    }, [location]);

    useEffect(() => {
        updateActiveTab();
    }, [location, updateActiveTab]);

    const loadObservatories = async () => {
        setIsNextPageLoading(true);

        try {
            const observatoriesPromise = getAllObservatories({}).then(res => res.content);
            const observatoryStatsPromise = getObservatoriesStats({}).then(res => res.content);
            const organizationsPromise = getAllOrganizations();
            const data = await Promise.all([observatoriesPromise, observatoryStatsPromise, organizationsPromise]);

            const observatoriesData = data[0].map(observatory => {
                const observatoryResource = data[1].find(el => el.observatory_id === observatory.id);
                return {
                    ...observatory,
                    papers: observatoryResource?.papers ?? 0,
                    comparisons: observatoryResource?.comparisons ?? 0,
                    total: observatoryResource?.total ?? 0,
                    organizations: observatory.organization_ids
                        .map(organizationId => data[2].find(o1 => o1.id === organizationId))
                        .sort((a, b) => a.name?.toLowerCase().localeCompare(b.name?.toLowerCase())),
                };
            });

            setObservatories({
                ...groupBy(observatoriesData, 'research_field.label'),
                'All research fields': observatoriesData,
            });
            setFailedLoading(false);
        } catch (e) {
            console.log(e);
            setFailedLoading(true);
        } finally {
            setIsNextPageLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Observatories - ORKG';
        loadObservatories();
    }, []);

    return (
        <>
            <TitleBar>View all observatories</TitleBar>
            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                Observatories organize research contributions in a particular research field and are curated by research organizations active in the
                respective field.{' '}
                <a href="https://orkg.org/about/27/Observatories" target="_blank" rel="noreferrer">
                    Learn more in the help center
                </a>
                .
            </Container>
            <Container className="box rounded p-4 clearfix">
                {observatories && Object.keys(observatories).length > 0 && (
                    <Row className="g-0">
                        <Col md={3} sm={12}>
                            <StyledResearchFieldList>
                                {Object.keys(observatories)
                                    .reverse()
                                    .map((rf, key) => (
                                        <li key={`${rf}`}>
                                            <StyledResearchFieldItem className={activeTab === key ? 'active' : ''} href={`#${key}`}>
                                                {rf === 'null' || '' ? 'Others' : rf}
                                            </StyledResearchFieldItem>
                                        </li>
                                    ))}
                            </StyledResearchFieldList>
                        </Col>

                        <Col md={9} sm={12} className="d-flex">
                            <StyledResearchFieldWrapper className="flex-grow-1 justify-content-center">
                                <TabContent activeTab={activeTab}>
                                    {Object.keys(observatories)
                                        .reverse()
                                        .map((rf, key) => (
                                            <TabPaneStyled key={`${rf}`} tabId={key}>
                                                <Row>
                                                    {observatories[rf].map(observatory => (
                                                        <ObservatoryCard key={`${rf}-${observatory.id}`} observatory={observatory} />
                                                    ))}
                                                </Row>
                                            </TabPaneStyled>
                                        ))}
                                </TabContent>
                            </StyledResearchFieldWrapper>
                        </Col>
                    </Row>
                )}
                {Object.keys(observatories).length === 0 && !isNextPageLoading && <div className="text-center mt-4 mb-4">No observatories yet</div>}
                {failedLoading && !isNextPageLoading && (
                    <div className="text-center mt-4 mb-4">Something went wrong while loading observatories!</div>
                )}
                {isNextPageLoading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
};

export default Observatories;
