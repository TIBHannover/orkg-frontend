import { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import Dotdotdot from 'react-dotdotdot';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { getComparisonData } from 'utils';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

export default function FeaturedComparisons() {
    const [comparisons, setComparisons] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('featured');
    const [dropdownOpen, setOpen] = useState(false);

    const toggle = () => setOpen(!dropdownOpen);

    const getFeaturedComparisons = async () => {
        setIsLoading(true);
        const responseJson = await getResourcesByClass({
            id: CLASSES.FEATURED_COMPARISON,
            sortBy: 'created_at',
            desc: true,
            items: 10
        });

        const ids = responseJson.map(comparison =>
            getStatementsBySubjectAndPredicate({ subjectId: comparison.id, predicateId: PREDICATES.DESCRIPTION })
        );

        Promise.all(ids)
            .then(comparisonsStatements => {
                const comparisons = comparisonsStatements.map((comparisonStatements, index) => {
                    const resourceSubject = responseJson[index];
                    return getComparisonData(resourceSubject, comparisonStatements);
                });

                // order featured comparison on show only that have onHomePage predicate
                //comparisons = comparisons.filter(c => c.onHomePage).sort((c1, c2) => sortMethod(c1.order, c2.order));
                setComparisons(comparisons);
                setIsLoading(false);
            })
            .catch(() => {
                setComparisons([]);
                setIsLoading(false);
            });
    };

    const getLatestComparisons = async () => {
        setIsLoading(true);

        const responseJson = await getResourcesByClass({
            id: CLASSES.COMPARISON,
            sortBy: 'created_at',
            desc: true,
            items: 8
        });

        const ids = responseJson.map(comparison =>
            getStatementsBySubjectAndPredicate({ subjectId: comparison.id, predicateId: PREDICATES.DESCRIPTION })
        );

        Promise.all(ids)
            .then(comparisonsStatements => {
                const comparisons = comparisonsStatements.map((comparisonStatements, index) => {
                    const resourceSubject = responseJson[index];
                    return getComparisonData(resourceSubject, comparisonStatements);
                });
                setComparisons(comparisons);
                setIsLoading(false);
            })
            .catch(() => {
                setComparisons([]);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (filter === 'featured') {
            getFeaturedComparisons();
        } else {
            getLatestComparisons();
        }
    }, [filter]);

    useEffect(() => {
        getFeaturedComparisons();
    }, []);

    return (
        <div className="pl-3 pr-3 pt-2 pb-3">
            <div className="d-flex justify-content-end mb-2">
                <ButtonDropdown size="sm" isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle caret color="lightblue">
                        {filter === 'featured' && 'Featured'}
                        {filter === 'latest' && 'Latest'}
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem onClick={() => setFilter('featured')}>Featured</DropdownItem>
                        <DropdownItem onClick={() => setFilter('latest')}>Latest</DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </div>
            {!isLoading ? (
                comparisons.length > 0 ? (
                    <>
                        <ListGroup>
                            {comparisons.map((comparison, index) => (
                                <ListGroupItem key={index} className="p-0 m-0 mb-2" style={{ border: 0 }}>
                                    <Link to={reverse(ROUTES.COMPARISON, { comparisonId: comparison.id })}>
                                        {comparison.label ? comparison.label : <em>No title</em>}
                                    </Link>
                                    <div style={{ fontSize: '13px' }} className="text-muted">
                                        <Dotdotdot clamp={3}>{comparison.description}</Dotdotdot>
                                    </div>
                                </ListGroupItem>
                            ))}
                        </ListGroup>

                        <div className="text-center">
                            <Link to={filter === 'featured' ? ROUTES.FEATURED_COMPARISONS : ROUTES.COMPARISONS}>
                                <Button color="primary" className="mr-3" size="sm">
                                    View more
                                </Button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center">{filter === 'featured' ? 'No featured comparison found' : 'No published comparison found'}</div>
                )
            ) : (
                <div className="text-center">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
        </div>
    );
}
