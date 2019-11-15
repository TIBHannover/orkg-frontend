import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';
import { faStream, faBars, faHeading, faTag } from '@fortawesome/free-solid-svg-icons';
import ColoredStatsBox from './ColoredStatsBox';
import InlineStatsBox from './InlineStatsBox';
import { toast } from 'react-toastify';
import { getStats } from '../../network';

class Stats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            stats: {}
        };
    }

    componentDidMount = () => {
        document.title = 'Stats - ORKG';
        this.setState({ isLoading: true });
        getStats()
            .then(stats => {
                this.setState({
                    stats,
                    isLoading: false
                });
            })
            .catch(e => {
                this.setState({ isLoading: false });
                toast.error('Failed loading statistics data');
            });
    };

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">General statistics</h1>
                </Container>

                <Container>
                    <Row>
                        <ColoredStatsBox
                            number={this.state.stats.papers}
                            label="Papers"
                            icon={faStream}
                            color="blue"
                            className="mr-3"
                            isLoading={this.state.isLoading}
                        />
                        <ColoredStatsBox
                            number={this.state.stats.contributions}
                            label="Contributions"
                            icon={faBars}
                            color="green"
                            className="mr-3"
                            isLoading={this.state.isLoading}
                        />
                        <ColoredStatsBox
                            number={this.state.stats.fields}
                            label="Research fields"
                            icon={faHeading}
                            color="orange"
                            className="mr-3"
                            isLoading={this.state.isLoading}
                        />
                        <ColoredStatsBox
                            number={this.state.stats.problems}
                            label="Research problems"
                            icon={faTag}
                            color="black"
                            isLoading={this.state.isLoading}
                        />
                    </Row>
                </Container>

                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Technical values</h1>
                </Container>

                <Container className="box pt-4 pb-4 pl-5 pr-5">
                    <Row>
                        <InlineStatsBox number={this.state.stats.resources} label="Resources" isLoading={this.state.isLoading} />
                        <InlineStatsBox number={this.state.stats.statements} label="Statements" isLoading={this.state.isLoading} />
                        <InlineStatsBox number={this.state.stats.literals} label="Literals" isLoading={this.state.isLoading} />
                        <InlineStatsBox number={this.state.stats.classes} label="Classes" hideBorder isLoading={this.state.isLoading} />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Stats;
