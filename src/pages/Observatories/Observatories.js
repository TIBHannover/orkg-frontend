import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ObservatoryCard from 'components/ObservatoryCard/ObservatoryCard';
import { observatoriesUrl, submitGetRequest } from 'network';
import { Container } from 'reactstrap';

class Observatories extends Component {
    constructor(props) {
        super(props);

        this.state = {
            observatories: [],
            isNextPageLoading: false
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
                const g = this.groupBy(observatories, 'researchField');
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

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View all observatories </h1>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5 clearfix">
                    {Object.keys(this.state.observatories)
                        .reverse()
                        .map(os => {
                            return (
                                <>
                                    <h5>{os === 'null' ? 'Others' : os}</h5>
                                    <div className="mt-3 row justify-content-center">
                                        {this.state.observatories[os].map(observatory => {
                                            return <ObservatoryCard key={observatory.id} observatory={observatory} />;
                                        })}
                                    </div>
                                </>
                            );
                        })}

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
