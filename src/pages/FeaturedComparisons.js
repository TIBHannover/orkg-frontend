import { Fragment, useState, useEffect, useCallback } from 'react';
import { Container, Alert, Row } from 'reactstrap';
import ROUTES from 'constants/routes';
import FeaturedComparisonsItem from 'components/FeaturedComparisons/FeaturedComparisonsItem';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { kebabCase, isString } from 'lodash';
import { useLocation, useHistory } from 'react-router';
import styled from 'styled-components';
import TitleBar from 'components/TitleBar/TitleBar';

const Header = styled.h2`
    &:hover a {
        visibility: visible !important;
    }
`;

const FeaturedComparisons = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [comparisons, setComparisons] = useState([]);
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        document.title = 'Featured comparisons - ORKG';

        getFeaturedComparisonCategories();
        getFeaturedComparisons();
    }, []);

    const scrollTo = useCallback(
        header => {
            const hash = location.hash;
            const id = isString(hash) ? hash.replace('#', '') : null;
            if (!header || header.id !== id) {
                return;
            }
            window.scrollTo({
                behavior: 'smooth',
                top: header.offsetTop - 90 // a little space between the select element and the top of the page
            });
        },
        [location.hash]
    );

    const handleClick = (e, id) => {
        history.push(`#${id}`);
        e.preventDefault();
    };

    const getFeaturedComparisonCategories = async () => {
        setLoading(true);

        const responseJson = await getResourcesByClass({
            id: CLASSES.FEATURED_COMPARISON_CATEGORY,
            sortBy: 'created_at',
            desc: false,
            returnContent: true
        });

        const categories = responseJson.map(item => ({
            label: item.label,
            id: item.id
        }));

        setCategories(categories);
    };

    const getFeaturedComparisons = async () => {
        const responseJson = await getResourcesByClass({
            id: CLASSES.FEATURED_COMPARISON,
            sortBy: 'created_at',
            desc: false,
            returnContent: true
        });

        const ids = responseJson.map(comparison => comparison.id);
        const comparisonStatements = await getStatementsBySubjects({
            ids
        });

        const comparisons = responseJson.map(comparison => {
            let description = '';
            let icon = '';
            let contributions = [];
            let type = '';

            for (const comparisonStatement of comparisonStatements) {
                if (comparisonStatement.id === comparison.id) {
                    const descriptionStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === PREDICATES.DESCRIPTION
                    );
                    description = descriptionStatement.length ? descriptionStatement[0].object.label : '';

                    const iconStatement = comparisonStatement.statements.filter(statement => statement.predicate.id === PREDICATES.ICON);
                    icon = iconStatement.length ? iconStatement[0].object.label : '';

                    // contributions
                    contributions = comparisonStatement.statements
                        .filter(statement => statement.predicate.id === PREDICATES.COMPARE_CONTRIBUTION)
                        .map(statement => statement.object);

                    const typeStatement = comparisonStatement.statements.filter(statement => statement.predicate.id === PREDICATES.TYPE);
                    type = typeStatement.length ? typeStatement[0].object.id : '';
                }
            }

            return {
                label: comparison.label,
                id: comparison.id,
                description,
                contributions,
                icon,
                type
            };
        });

        setComparisons(comparisons);
        setLoading(false);
    };

    return (
        <div>
            <TitleBar
                buttonGroup={
                    <Link to={ROUTES.COMPARISONS} className="btn btn-secondary flex-shrink-0 btn-sm">
                        View all comparisons
                    </Link>
                }
            >
                Featured paper comparisons
            </TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Alert color="info" fade={false}>
                    With the paper data inside the ORKG, you can build powerful paper comparisons. On this page, we list the featured comparisons that
                    are created using the comparison functionality. The featured comparisons below are organized by category.
                </Alert>

                {loading ? (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                ) : (
                    categories.map(category => {
                        const id = encodeURIComponent(kebabCase(category.label));
                        return (
                            <Fragment key={category.id}>
                                <Header id={id} ref={scrollTo} className="h4 mt-4 mb-3">
                                    {category.label}
                                    <a href={`#${id}`} className="ms-2 invisible" onClick={e => handleClick(e, id)}>
                                        <Icon icon={faLink} />
                                    </a>
                                </Header>

                                <Row>
                                    {comparisons
                                        .filter(comparison => comparison.type === category.id)
                                        .map(comparison => (
                                            <FeaturedComparisonsItem
                                                key={comparison.id}
                                                title={comparison.label}
                                                description={comparison.description}
                                                icon={comparison.icon}
                                                id={comparison.id}
                                                contributions={comparison.contributions}
                                            />
                                        ))}
                                </Row>
                            </Fragment>
                        );
                    })
                )}
            </Container>
        </div>
    );
};

export default FeaturedComparisons;
