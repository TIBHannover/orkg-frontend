import React, { Component } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { observatoriesUrl, submitGetRequest, organizationsUrl } from 'network';
import { Container } from 'reactstrap';
import ObservatoryCard from 'components/ObservatoryCard/ObservatoryCard';
import { Col, Row } from 'reactstrap';
import { TabContent, TabPane, NavLink } from 'reactstrap';
import classnames from 'classnames';
import styled from 'styled-components';

const TabPaneStyled = styled(TabPane)`
    border-top: 0;
`;

export const StyledResearchFieldWrapper = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border-width: ${props => props.theme.borderWidth};
    border-color: ${props => props.theme.orkgPrimaryColor};
    border-style: solid;
    padding: 15px 30px;
`;

export const StyledResearchFieldList = styled.ul`
    list-style: none;
    padding: 0;
    padding-top: 15px;

    > li {
        padding: 9px 10px 9px 15px;
        margin-bottom: 5px;
        transition: 0.3s background;
        border-top-left-radius: ${props => props.theme.borderRadius};
        border-bottom-left-radius: ${props => props.theme.borderRadius};
        background: ${props => props.theme.ultraLightBlueDarker};
        cursor: pointer !important;

        > span {
            cursor: pointer;
        }

        &.activeRF {
            background: ${props => props.theme.orkgPrimaryColor};
            color: #fff;
            cursor: initial !important;
        }
    }
`;

class Observatories extends Component {
    constructor(props) {
        super(props);

        this.state = {
            observatories: [],
            isNextPageLoading: false,
            activeTab: 0,
            isLoadingOrganizations: false
        };
    }

    componentDidMount() {
        document.title = 'Observatories - ORKG';
        this.loadObservatories();
    }

    loadObservatories = () => {
        this.loadOrganizations();
    };

    groupBy = async (array, key) => {
        return array.reduce((result, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
            return result;
        }, {});
    };

    loadOrganizations = () => {
        this.setState({ isNextPageLoading: true });
        const observatories = submitGetRequest(`${observatoriesUrl}`);
        const obsStats = submitGetRequest(`${observatoriesUrl}stats/observatories`);
        const organizations = submitGetRequest(`${organizationsUrl}`);

        Promise.all([observatories, obsStats, organizations]).then(async data => {
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

            const g = await this.groupBy(observatoriesData, 'research_field');
            g['All research fields'] = observatoriesData;
            this.setState({
                observatories: g,
                isNextPageLoading: false
            });
        });
    };

    toggleTab = tab => {
        this.setState({
            activeTab: tab
        });
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all observatories </h1>
                </Container>
                <Container className="box rounded p-4 clearfix">
                    {this.state.observatories && Object.keys(this.state.observatories).length > 0 && (
                        <Row noGutters={true}>
                            <Col md={3} sm={12}>
                                <StyledResearchFieldList>
                                    {Object.keys(this.state.observatories)
                                        .reverse()
                                        .map((rf, key) => {
                                            return (
                                                <li key={`${rf}`} className={this.state.activeTab === key ? 'activeRF' : ''}>
                                                    <NavLink
                                                        className={classnames({ active: this.state.activeTab === key })}
                                                        onClick={() => {
                                                            this.toggleTab(key);
                                                        }}
                                                    >
                                                        {rf === 'null' || '' ? 'Others' : rf}
                                                    </NavLink>
                                                </li>
                                            );
                                        })}
                                </StyledResearchFieldList>
                            </Col>

                            <Col md={9} sm={12} className="d-flex">
                                <StyledResearchFieldWrapper className="flex-grow-1 justify-content-center">
                                    <TabContent activeTab={this.state.activeTab}>
                                        {Object.keys(this.state.observatories)
                                            .reverse()
                                            .map((rf, key) => {
                                                return (
                                                    <TabPaneStyled key={`rf${rf.id}-${key}`} tabId={key}>
                                                        <Row>
                                                            {this.state.observatories[rf].map(observatory => {
                                                                return <ObservatoryCard key={observatory.id} observatory={observatory} />;
                                                            })}
                                                        </Row>
                                                    </TabPaneStyled>
                                                );
                                            })}
                                    </TabContent>
                                </StyledResearchFieldWrapper>
                            </Col>
                        </Row>
                    )}
                    {Object.keys(this.state.observatories).length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No observatories yet!</div>
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

export default Observatories;
