import { useState, useEffect, useCallback } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ObservatoryCard from 'components/ObservatoryCard/ObservatoryCard';
import { getAllObservatories, getObservatoriesStats } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
import { Container, Col, Row, TabContent, TabPane, NavLink } from 'reactstrap';
import styled from 'styled-components';
import { groupBy } from 'lodash';
import TitleBar from 'components/TitleBar/TitleBar';

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

        const activeTab = hash.replace('#', '');

        setActiveTab(parseInt(activeTab));
    }, [location]);

    useEffect(() => {
        document.title = 'Observatories - ORKG';
        loadObservatories();
        updateActiveTab();
    }, [updateActiveTab]);

    useEffect(() => {
        updateActiveTab();
    }, [location, updateActiveTab]);

    const loadObservatories = () => {
        setIsNextPageLoading(true);
        const observatories = getAllObservatories();
        const obsStats = getObservatoriesStats();
        const organizations = getAllOrganizations();

        Promise.all([observatories, obsStats, organizations])
            .then(async data => {
                const observatoriesData = [];
                for (const observatory of data[0]) {
                    const obsresource = data[1].find(el => el.observatory_id === observatory.id);
                    if (obsresource) {
                        observatory.numPapers = obsresource.resources;
                        observatory.numComparisons = obsresource.comparisons;
                    } else {
                        observatory.numPapers = 0;
                        observatory.numComparisons = 0;
                    }

                    for (let i = 0; i < observatory.organization_ids.length; i++) {
                        const org = data[2].find(o1 => o1.id === observatory.organization_ids[i]);
                        observatory.organization_ids[i] = org;
                    }
                    observatoriesData.push(observatory);
                }
                const g = groupBy(observatoriesData, 'research_field.label');
                g['All research fields'] = observatoriesData;

                setObservatories(g);
                setIsNextPageLoading(false);
                setFailedLoading(false);
            })
            .catch(e => {
                setFailedLoading(true);
                setIsNextPageLoading(false);
            });
    };

    return (
        <>
            <TitleBar>View all observatories</TitleBar>
            <Container className="box rounded p-4 clearfix">
                <p>
                    <i>Observatories</i> organize research contributions in a particular research field and are curated by research organizations
                    active in the respective field.{' '}
                </p>
                <p>
                    Further information about observatories can be also found in the{' '}
                    <a
                        href="https://www.orkg.org/orkg/help-center/article/8/Observatories_for_specific_research_fields"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ORKG help center
                    </a>
                    .
                </p>
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
                {Object.keys(observatories).length === 0 && !isNextPageLoading && <div className="text-center mt-4 mb-4">No observatories yet!</div>}
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
