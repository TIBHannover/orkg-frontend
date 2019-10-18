import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';
import { faStream, faBars, faHeading, faTag } from '@fortawesome/free-solid-svg-icons';
import ColoredStatsBox from './ColoredStatsBox';
import InlineStatsBox from './InlineStatsBox';
import { getStats } from '../../network';

class Stats extends Component {

    state = {
        stats: {}
    };

    componentDidMount = () => {
        document.title = 'Stats - ORKG';

        getStats().then((stats) => {
            this.setState({
                stats
            })
        });
    }

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
                        />
                        <ColoredStatsBox 
                            number={this.state.stats.contributions}
                            label="Contributions"
                            icon={faBars}
                            color="green"
                            className="mr-3"
                        />
                        <ColoredStatsBox 
                            number={this.state.stats.fields}
                            label="Research fields"
                            icon={faHeading}
                            color="orange"
                            className="mr-3"
                        />
                        <ColoredStatsBox 
                            number={this.state.stats.problems}
                            label="Research problems"
                            icon={faTag}
                            color="black"
                        />
                    </Row>
                </Container>

                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Technical values</h1>
                </Container>

                <Container className="box pt-4 pb-4 pl-5 pr-5">
                    <Row>
                        <InlineStatsBox
                            number={this.state.stats.resources}
                            label="Resources"
                        />
                        <InlineStatsBox
                            number={this.state.stats.statements}
                            label="Statements"
                        />
                        <InlineStatsBox
                            number={this.state.stats.literals}
                            label="Literals"
                        />
                        <InlineStatsBox
                            number={this.state.stats.classes}
                            label="Classes"
                            hideBorder
                        />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Stats;