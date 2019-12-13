import React, { Component } from 'react';
import { Container, Alert, Row } from 'reactstrap';
import FeaturedComparisonsItem from './FeaturedComparisonsItem';
import { getResourcesByClass, getStatementsBySubjects } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

class FeaturedComparisons extends Component {
    state = {
        loading: false,
        categories: [],
        comparisons: []
    };

    componentDidMount = () => {
        document.title = 'Featured comparisons - ORKG';

        this.getFeaturedComparisonCategories();
        this.getFeaturedComparisons();
    };

    /* TODO: It isn't good practice to store this data in the graph, should be changed later */
    getFeaturedComparisonCategories = async () => {
        this.setState({
            loading: true
        });

        let responseJson = await getResourcesByClass({
            id: process.env.REACT_APP_CLASSES_FEATURED_COMPARISON_CATEGORY,
            sortBy: 'created_at',
            desc: false
        });

        const categories = responseJson.map(item => ({
            label: item.label,
            id: item.id
        }));

        this.setState({
            categories
        });
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

        const comparisons = responseJson.map(comparison => {
            let description = '';
            let icon = '';
            let url = '';
            let type = '';

            for (const comparisonStatement of comparisonStatements) {
                if (comparisonStatement.id === comparison.id) {
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

            return {
                label: comparison.label,
                id: comparison.id,
                description,
                url,
                icon,
                type
            };
        });

        this.setState({
            comparisons,
            loading: false
        });
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

                    {this.state.loading ? (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    ) : (
                        this.state.categories.map(category => (
                            <React.Fragment key={category.id}>
                                <h2 className="h4 mt-4 mb-3">{category.label}</h2>

                                <Row>
                                    {this.state.comparisons.map(comparison => {
                                        if (comparison.type !== category.id) {
                                            return <React.Fragment key={comparison.id}></React.Fragment>;
                                        }

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
                                </Row>
                            </React.Fragment>
                        ))
                    )}

                    {/*<Row>
                        <FeaturedComparisonsItem
                            title="Knowledge graph visualizations"
                            description="The state-of-the-art visualization systems are compared. Particularly interesting is to see which data types are
                            supported."
                            paperAmount={11}
                            icon={faProjectDiagram}
                            link="/comparison/?contributions=R146306,R146302,R146298,R146294,R146290,R146286,R146282,R146278,R146274,R146270,R146266,R146262,R146258,R146254,R146250,R146246,R146242,R146238&properties=P32,P20037,P15,P20036,P20033,P20035,P20031,P20034,P20030,P20032&transpose=false"
                        />
                    </Row>
                    <h2 className="h4 mt-5 mb-3">Questions answering</h2>
                    <Row>
                        <FeaturedComparisonsItem
                            title="Question answering system tasks"
                            description="In this comparison 17 different question answering systems are compared based on the tasks that the address."
                            paperAmount={17}
                            icon={faQuestion}
                            link="/comparison/?contributions=R150103,R150106,R150109,R150112,R150138,R150141,R150151,R150154,R150157,R150160,R150188,R150191,R150202,R150218,R150221,R150233,R150236&properties=P32,P15,P20130,P20129,P20131,P20128&transpose=false"
                        />
                        <FeaturedComparisonsItem
                            title="QALD4 QA evaluations"
                            description="Multiple question answering systems are compared based on the QALD4 task. Results include the system performance using the F-measure."
                            paperAmount={5}
                            icon={faCheck}
                            link="/comparison/?contributions=R150179,R150181,R150177,R150175,R150173&properties=P32,P34,P20126,P16002,P20124,P20122,P20123,P20125&transpose=false"
                        />
                    </Row>

                    <h2 className="h4 mt-5 mb-3">Author disambiguation</h2>
                    <h2 className="h4 mt-5 mb-3">Text summarization</h2>*/}
                </Container>
            </div>
        );
    }
}

export default FeaturedComparisons;
