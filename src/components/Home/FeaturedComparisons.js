import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button, Card, CardImg, CardTitle, CardText, CardDeck, CardSubtitle, CardBody, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import { getResourcesByClass, getStatementsBySubject } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEquals } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { equal } from 'assert';
import FeaturedComparisonsItem from '../StaticPages/FeaturedComparisons/FeaturedComparisonsItem';
import { faChartArea, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';

class FeaturedComparisons extends Component {
    render() {
        return (
            <div className="mt-3 pl-3 pr-3">
                {/*<CardDeck>
                    <Card style={{ border: 'none' }}>
                        <CardBody>
                            <Link
                                style={{ color: 'inherit' }}
                                to={
                                    '/comparison/?contributions=R146151,R146139,R146127,R146115,R146103,R146091,R146079,R146067,R146055,R146043,R146031&properties=P32,P20010,P20001,P20009,P20006,P20000,P20008,P15,P20007,P20003,P20005,P20004,P20002&transpose=false'
                                }
                            >
                                <CardTitle tag="h5">General visualization systems comparison</CardTitle>
                            </Link>
                            <CardText style={{ fontSize: '0.9rem' }}>
                                The state-of-the-art visualization systems are compared. Particularly interesting is to see which data types are
                                supported.
                            </CardText>
                            <span className="badge badge-lightblue"> 11 papers</span>{' '}
                        </CardBody>
                    </Card>
                    <Card style={{ border: 'none' }}>
                        <CardBody>
                            <Link
                                style={{ color: 'inherit' }}
                                to={
                                    '/comparison/?contributions=R146306,R146302,R146298,R146294,R146290,R146286,R146282,R146278,R146274,R146270,R146266,R146262,R146258,R146254,R146250,R146246,R146242,R146238&properties=P32,P20037,P15,P20036,P20033,P20035,P20031,P20034,P20030,P20032&transpose=false'
                                }
                            >
                                <CardTitle tag="h5">Graph visualization systems comparison</CardTitle>
                            </Link>
                            <CardText style={{ fontSize: '0.9rem' }}>
                                In this comparsion, graph visualization systems are compared. Some systems support more features than others.
                            </CardText>
                            <span className="badge badge-lightblue"> 11 papers</span>{' '}
                        </CardBody>
                    </Card>
                    <Card style={{ border: 'none' }}>
                        <CardBody>
                            <CardTitle tag="h5">General visualization systems comparison</CardTitle>
                            <CardText style={{ fontSize: '0.9rem' }}>
                                The state-of-the-art visualization systems are compared. Particularly interesting is to see which data types are
                                supported.
                            </CardText>
                            <span className="badge badge-lightblue"> 11 papers</span>{' '}
                        </CardBody>
                    </Card>
                </CardDeck>*/}
                <Row style={{ margin: '25px 0 20px' }}>
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
                <div className="text-center">
                    <Link to={ROUTES.FEATURED_COMPARISONS}>
                        <Button color="darkblue" size="sm" className="mr-3">
                            More comparisons
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }
}

export default FeaturedComparisons;
