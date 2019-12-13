import React, { Component } from 'react';
import { Button, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import FeaturedComparisonsItem from '../FeaturedComparisons/FeaturedComparisonsItem';
import { faChartArea, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { getResourcesByClass, getStatementsBySubjects } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

class FeaturedComparisons extends Component {
    state = {
        loading: false,
        comparisons: []
    };
    componentDidMount = () => {
        document.title = 'Featured comparisons - ORKG';

        this.getFeaturedComparisons();
    };

    getFeaturedComparisons = async () => {
        let responseJson = await getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_FEATURED_COMPARISON,
            sortBy: 'created_at',
            desc: false
        });

        const ids = responseJson.map(comparison => comparison.id);
        const comparisonStatements = await getStatementsBySubjects({
            ids
        });

        let comparisons = [];
        for (const comparison of responseJson) {
            let description = '';
            let icon = '';
            let url = '';
            let type = '';
            let onHomepage = false;

            for (const comparisonStatement of comparisonStatements) {
                if (comparisonStatement.id === comparison.id) {
                    const onHomepageStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_ON_HOMEPAGE
                    );
                    onHomepage = onHomepageStatement.length > 0 ? true : false;

                    const descriptionStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_DESCRIPTION
                    );
                    description = descriptionStatement.length > 0 ? descriptionStatement[0].object.label : '';

                    const iconStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_ICON
                    );
                    icon = iconStatement.length > 0 ? iconStatement[0].object.label : '';

                    const urlStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_URL
                    );
                    url = urlStatement.length > 0 ? urlStatement[0].object.label : '';

                    const typeStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_TYPE
                    );
                    type = typeStatement.length > 0 ? typeStatement[0].object.id : '';
                }
            }

            if (!onHomepage) {
                continue;
            }

            comparisons.push({
                label: comparison.label,
                id: comparison.id,
                description,
                url,
                icon,
                type
            });
        }

        this.setState({
            comparisons,
            loading: false
        });
    };

    render() {
        return (
            <div className="mt-3 pl-3 pr-3">
                {this.state.loading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}

                <Row style={{ margin: '25px 0 20px' }}>
                    {this.state.comparisons.map(comparison => {
                        return (
                            <FeaturedComparisonsItem
                                key={comparison.id}
                                title={comparison.label}
                                description={comparison.description}
                                icon={comparison.icon}
                                link={comparison.url}
                            />
                        );
                    })}

                    {/*<FeaturedComparisonsItem
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
                    />*/}
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
