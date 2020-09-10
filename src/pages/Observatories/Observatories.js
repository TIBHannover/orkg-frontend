import React from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { observatoriesUrl, submitGetRequest, getOrganization, getPapersCountByObservatoryId, getComparisonsCountByObservatoryId } from 'network';
import { Container } from 'reactstrap';
import ObservatoryCard from 'components/ObservatoryCard/ObservatoryCard';
import { Col, Row } from 'reactstrap';
import { withStyles } from '@material-ui/core/styles';

const VerticalTabs = withStyles(theme => ({
    flexContainer: {
        flexDirection: 'column'
    },
    indicator: {
        display: 'none'
    }
}))(Tabs);

const MyTab = withStyles(theme => ({
    selected: {
        color: '#e86161'
    }
}))(Tab);

class Observatories extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            observatories: [],
            isNextPageLoading: false,
            activeIndex: 0,
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
            .then(observatories => {
                observatories = this.loadObservatoriesStat(observatories);
                const updatedObservatories = this.loadOrganizations(observatories);
                const g = this.groupBy(updatedObservatories, 'researchField');
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

    groupBy = (array, key) => {
        return array.reduce((result, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
            return result;
        }, {});
    };

    loadOrganizations = observatoriesData => {
        this.setState({ isLoadingOrganizations: true });
        observatoriesData.map(o => {
            const a = [];
            o.organizations.map(or => {
                getOrganization(or.id).then(oe => {
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

    loadObservatoriesStat = observatoriesData => {
        observatoriesData.map(o => {
            getPapersCountByObservatoryId(o.id).then(obs => {
                o.papers = obs;
            });
            getComparisonsCountByObservatoryId(o.id).then(obs => {
                o.comparisons = obs;
            });
        });
        return observatoriesData;
    };

    handleChange = (_, activeIndex) => this.setState({ activeIndex });
    render() {
        const { activeIndex } = this.state;
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all observatories </h1>
                </Container>
                <Container style={{ maxWidth: 'calc(100% - 500px)' }} className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix">
                    <Row>
                        <Col md={4} sm={12}>
                            <VerticalTabs value={activeIndex} onChange={this.handleChange}>
                                {Object.keys(this.state.observatories).map((rf, key) => {
                                    return <MyTab style={{ border: 'none' }} key={`c${key}`} label={rf === 'null' || '' ? 'Others' : rf} />;
                                })}
                            </VerticalTabs>
                        </Col>
                        <Col md={8} sm={12}>
                            <div className="mt-3 row justify-content-center">
                                {Object.keys(this.state.observatories).map((rf, key) => {
                                    return (
                                        activeIndex === key && (
                                            <>
                                                {this.state.observatories[rf].map(observatory => {
                                                    return <ObservatoryCard key={observatory.id} observatory={observatory} />;
                                                })}
                                            </>
                                        )
                                    );
                                })}
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
