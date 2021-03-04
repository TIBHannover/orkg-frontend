import { useState, useEffect } from 'react';
import { ListGroup, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import { find } from 'lodash';
import { getComparisonData } from 'utils';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CLASSES } from 'constants/graphSettings';

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
            returnContent: true,
            items: 14
        });

        getStatementsBySubjects({
            ids: responseJson.map(p => p.id)
        })
            .then(comparisonsStatements => {
                const comparisons = comparisonsStatements.map(comparisonStatements => {
                    const paperSubject = find(responseJson, {
                        id: comparisonStatements.id
                    });
                    return getComparisonData(paperSubject, comparisonStatements.statements);
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
            items: 14,
            returnContent: true
        });

        getStatementsBySubjects({
            ids: responseJson.map(p => p.id)
        })
            .then(comparisonsStatements => {
                const comparisons = comparisonsStatements.map(comparisonStatements => {
                    const paperSubject = find(responseJson, {
                        id: comparisonStatements.id
                    });
                    return getComparisonData(paperSubject, comparisonStatements.statements);
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
        <div className="pt-2 pb-3">
            <div className="mr-2 d-flex justify-content-end mb-2">
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
                            {comparisons.map(comparison => {
                                return comparison && <ComparisonCard comparison={{ ...comparison }} key={`pc${comparison.id}`} />;
                            })}
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
