import React, { Component } from 'react';
import { Container, Alert, Card, CardImg, CardTitle, CardText, Row, Col, CardBody, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChartArea, faProjectDiagram, faQuestion, faCheck } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import FeaturedComparisonsItem from './FeaturedComparisons/FeaturedComparisonsItem';

const Comparison = styled(Card)`
    border-width: 1px !important; //TODO: remove once style of 1px border is applied globally
    cursor: pointer;
    background: #f7f7f7 !important;
`;

const ComparisonBody = styled(CardBody)`
    padding: 10px !important;
`;

const ImageCol = styled(Col)`
    font-size: 50px;
    color: #80869b;
    border-right: 1px solid #d9d9d9;
`;

const ComparisonTitle = styled(CardTitle)`
    //color: #e86161;
    margin-bottom: 5px;
    font-weight: 600;
`;

const ComparisonText = styled(CardText)`
    font-size: 0.9rem;
    margin-bottom: 5px;
`;

class FeaturedComparisons extends Component {
    componentDidMount = () => {
        document.title = 'Featured comparisons - ORKG';
    };

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Featured paper comparisons</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5">
                    <Alert color="info">
                        With the paper data inside the ORKG, you can build powerful paper comparisons. On this page, we list of the featured
                        comparisons that are created using the comparison functionality. The featured comparisons below are structured by category.
                        They consist of paper comparisons of state-of-the-art work from the Computer Science field
                    </Alert>
                    <h2 className="h4 mt-4 mb-3">Visualization</h2>
                    <Row>
                        <FeaturedComparisonsItem
                            title="General visualization systems"
                            description="In this comparsion, graph visualization systems are compared. Some systems support more features than
                            others."
                            paperAmount="11"
                            icon={faChartArea}
                            link="/comparison/?contributions=R146151,R146139,R146127,R146115,R146103,R146091,R146079,R146067,R146055,R146043,R146031&properties=P32,P20010,P20001,P20009,P20006,P20000,P20008,P15,P20007,P20003,P20005,P20004,P20002&transpose=false"
                        />
                        <FeaturedComparisonsItem
                            title="Knowledge graph visualizations"
                            description="The state-of-the-art visualization systems are compared. Particularly interesting is to see which data types are
                            supported."
                            paperAmount="11"
                            icon={faProjectDiagram}
                            link="/comparison/?contributions=R146306,R146302,R146298,R146294,R146290,R146286,R146282,R146278,R146274,R146270,R146266,R146262,R146258,R146254,R146250,R146246,R146242,R146238&properties=P32,P20037,P15,P20036,P20033,P20035,P20031,P20034,P20030,P20032&transpose=false"
                        />
                    </Row>
                    <h2 className="h4 mt-5 mb-3">Questions answering</h2>
                    <Row>
                        <FeaturedComparisonsItem
                            title="Question answering system tasks"
                            description="In this comparison 17 different question answering systems are compared based on the tasks that the address."
                            paperAmount="17"
                            icon={faQuestion}
                            link="/comparison/?contributions=R150103,R150106,R150109,R150112,R150138,R150141,R150151,R150154,R150157,R150160,R150188,R150191,R150202,R150218,R150221,R150233,R150236&properties=P32,P15,P20130,P20129,P20131,P20128&transpose=false"
                        />
                        <FeaturedComparisonsItem
                            title="QALD4 QA evaluations"
                            description="Multiple question answering systems are compared based on the QALD4 task. Results include the system performance using the F-measure."
                            paperAmount="17"
                            icon={faCheck}
                            link="/comparison/?contributions=R150179,R150181,R150177,R150175,R150173&properties=P32,P34,P20126,P16002,P20124,P20122,P20123,P20125&transpose=false"
                        />
                    </Row>

                    <h2 className="h4 mt-5 mb-3">Author disambiguation</h2>
                    <h2 className="h4 mt-5 mb-3">Text summarization</h2>
                </Container>
            </div>
        );
    }
}

export default FeaturedComparisons;
