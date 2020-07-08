import React, { Component } from 'react';
import { Container, Alert, Row, ButtonGroup } from 'reactstrap';
import ROUTES from 'constants/routes';
import FeaturedComparisonsItem from './FeaturedComparisonsItem';
import { getResourcesByClass, getStatementsBySubjects } from '../../network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

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

        const responseJson = await getResourcesByClass({
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
        const responseJson = await getResourcesByClass({
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
                <Container className="p-0 d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">Featured paper comparisons</h1>
                    <ButtonGroup className="flex-shrink-0">
                        <Link to={ROUTES.COMPARISONS} className="btn btn-darkblue flex-shrink-0 btn-sm">
                            View all comparisons
                        </Link>
                    </ButtonGroup>
                </Container>
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                    <Alert color="info">
                        With the paper data inside the ORKG, you can build powerful paper comparisons. On this page, we list the featured comparisons
                        that are created using the comparison functionality. The featured comparisons below are organized by category.
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
                                            return <React.Fragment key={comparison.id} />;
                                        }

                                        return (
                                            <FeaturedComparisonsItem
                                                key={comparison.id}
                                                title={comparison.label}
                                                description={comparison.description}
                                                icon={comparison.icon}
                                                id={comparison.id}
                                                link={comparison.url}
                                            />
                                        );
                                    })}
                                </Row>
                            </React.Fragment>
                        ))
                    )}
                </Container>
            </div>
        );
    }
}

export default FeaturedComparisons;
