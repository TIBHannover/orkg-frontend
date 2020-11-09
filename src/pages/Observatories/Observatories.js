import React, { Component } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ObservatoryCard from 'components/ObservatoryCard/ObservatoryCard';
import { getAllObservatories, getObservatoriesStats } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Container } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import { TabContent, TabPane, NavLink } from 'reactstrap';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { groupBy } from 'lodash';

const TabPaneStyled = styled(TabPane)`
    border-top: 0;
`;

export const StyledResearchFieldWrapper = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border: ${props => props.theme.borderWidth} solid ${props => props.theme.orkgPrimaryColor};
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
    border: 1px solid ${props => props.theme.ultraLightBlueDarker};
    background-color: ${props => props.theme.ultraLightBlue};
    color: inherit;

    cursor: pointer !important;

    > span {
        cursor: pointer;
    }

    &.active {
        background: ${props => props.theme.orkgPrimaryColor};
        color: #fff;
        cursor: initial !important;
        border-color: ${props => props.theme.orkgPrimaryColor};
    }
`;

class Observatories extends Component {
    state = {
        observatories: [],
        isNextPageLoading: false,
        failedLoading: false,
        activeTab: 0
    };

    componentDidMount() {
        document.title = 'Observatories - ORKG';
        this.loadObservatories();
        this.setActiveTab();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.hash !== this.props.location.hash) {
            this.setActiveTab();
        }
    }

    setActiveTab = () => {
        const { hash } = this.props.location;

        if (!hash) {
            return;
        }

        const activeTab = hash.replace('#', '');

        this.setState({
            activeTab: parseInt(activeTab)
        });
    };

    loadObservatories = () => {
        this.setState({ isNextPageLoading: true });
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
                const g = groupBy(observatoriesData, 'research_field');
                g['All research fields'] = observatoriesData;

                this.setState({
                    observatories: g,
                    isNextPageLoading: false,
                    failedLoading: false
                });
            })
            .catch(e => {
                this.setState({
                    failedLoading: true,
                    isNextPageLoading: false
                });
            });
    };

    render() {
        return (
            <>
                <Container>
                    <h1 className="h4 mt-4 mb-4">View all observatories</h1>
                </Container>
                <Container className="box rounded p-4 clearfix">
                    <p>
                        <i>Observatories</i> organize research contributions in a particular research field and are curated by research organizations
                        active in the respective field.{' '}
                    </p>
                    <p>
                        Further information about observatories can be also found in the{' '}
                        <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Observatories"> ORKG wiki</a>.
                    </p>
                    {this.state.observatories && Object.keys(this.state.observatories).length > 0 && (
                        <Row noGutters={true}>
                            <Col md={3} sm={12}>
                                <StyledResearchFieldList>
                                    {Object.keys(this.state.observatories)
                                        .reverse()
                                        .map((rf, key) => (
                                            <li key={`${rf}`}>
                                                <StyledResearchFieldItem className={this.state.activeTab === key ? 'active' : ''} href={`#${key}`}>
                                                    {rf === 'null' || '' ? 'Others' : rf}
                                                </StyledResearchFieldItem>
                                            </li>
                                        ))}
                                </StyledResearchFieldList>
                            </Col>

                            <Col md={9} sm={12} className="d-flex">
                                <StyledResearchFieldWrapper className="flex-grow-1 justify-content-center">
                                    <TabContent activeTab={this.state.activeTab}>
                                        {Object.keys(this.state.observatories)
                                            .reverse()
                                            .map((rf, key) => (
                                                <TabPaneStyled key={`${rf}`} tabId={key}>
                                                    <Row>
                                                        {this.state.observatories[rf].map(observatory => (
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
                    {Object.keys(this.state.observatories).length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No observatories yet!</div>
                    )}
                    {this.state.failedLoading && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">Something went wrong while loading observatories!</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                </Container>
            </>
        );
    }
}

Observatories.propTypes = {
    location: PropTypes.object.isRequired
};

export default withRouter(Observatories);
