import React, { Component } from 'react';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { observatoriesUrl, submitGetRequest, getOrganization } from 'network';
import { Container } from 'reactstrap';
import ObservatoryCard from 'components/ObservatoryCard/ObservatoryCard';
import { Col, Row } from 'reactstrap';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import styled from 'styled-components';

const TabPaneStyled = styled(TabPane)`
    border-top: 0;
`;

const NavItemStyled = styled(NavItem)`
    cursor: pointer;
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
        this.setState({ isNextPageLoading: true });
        submitGetRequest(observatoriesUrl)
            .then(async observatories => {
                observatories = await this.loadOrganizations(observatories);
                const g = await this.groupBy(observatories, 'researchField');
                if (observatories.length > 0) {
                    this.setState({
                        observatories: g,
                        isNextPageLoading: false
                    });
                } else {
                    this.setState({
                        isNextPageLoading: false
                    });
                }
            })
            .catch(error => {
                this.setState({
                    isNextPageLoading: false
                });
            });
    };

    groupBy = async (array, key) => {
        return array.reduce((result, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
            return result;
        }, {});
    };

    loadOrganizations = async observatoriesData => {
        this.setState({ isLoadingOrganizations: true });

        await observatoriesData.forEach(async o => {
            const a = [];
            await o.organizations.forEach(async or => {
                await getOrganization(or.id).then(oe => {
                    a.push(oe);
                });
            });
            o.organizations = a;
        });
        this.setState({
            isLoadingOrganizations: false
        });
        return observatoriesData;
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
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix">
                    <Row>
                        <Col md={4} sm={12}>
                            <Nav tabs className="flex-column">
                                {Object.keys(this.state.observatories).map((rf, key) => {
                                    return (
                                        <>
                                            <NavItemStyled>
                                                <NavLink
                                                    className={classnames({ active: this.state.activeTab === key })}
                                                    onClick={() => {
                                                        this.toggleTab(key);
                                                    }}
                                                >
                                                    {rf === 'null' || '' ? 'Others' : rf}
                                                </NavLink>
                                            </NavItemStyled>
                                        </>
                                    );
                                })}
                            </Nav>
                        </Col>
                        <Col md={8} sm={12}>
                            <div className="mt-3 row justify-content-center">
                                <TabContent activeTab={this.state.activeTab}>
                                    {Object.keys(this.state.observatories).map((rf, key) => {
                                        return (
                                            <TabPaneStyled tabId={key}>
                                                {this.state.observatories[rf].map(observatory => {
                                                    return <ObservatoryCard key={observatory.id} observatory={observatory} />;
                                                })}
                                            </TabPaneStyled>
                                        );
                                    })}
                                </TabContent>
                            </div>
                        </Col>
                    </Row>

                    {this.state.observatories.length === 0 && !this.state.isNextPageLoading && (
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
