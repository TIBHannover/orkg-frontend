import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import Dotdotdot from 'react-dotdotdot';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { sortMethod } from 'utils';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

export default function FeaturedComparisons() {
    const [comparisons, setComparisons] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getFeaturedComparisons = async () => {
        setIsLoading(true);

        const responseJson = await getResourcesByClass({
            id: CLASSES.FEATURED_COMPARISON,
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
            const url = '';
            let type = '';
            let order = Infinity;
            let onHomepage = false;

            for (const comparisonStatement of comparisonStatements) {
                if (comparisonStatement.id === comparison.id) {
                    const onHomepageStatement = comparisonStatement.statements.filter(statement => statement.predicate.id === PREDICATES.ON_HOMEPAGE);
                    onHomepage = onHomepageStatement.length > 0 ? true : false;

                    const descriptionStatement = comparisonStatement.statements.filter(
                        statement => statement.predicate.id === PREDICATES.DESCRIPTION
                    );
                    description = descriptionStatement.length > 0 ? descriptionStatement[0].object.label : '';

                    const iconStatement = comparisonStatement.statements.filter(statement => statement.predicate.id === PREDICATES.ICON);
                    icon = iconStatement.length > 0 ? iconStatement[0].object.label : '';

                    const typeStatement = comparisonStatement.statements.filter(statement => statement.predicate.id === PREDICATES.TYPE);
                    type = typeStatement.length > 0 ? typeStatement[0].object.id : '';

                    const orderStatement = comparisonStatement.statements.filter(statement => statement.predicate.id === PREDICATES.ORDER);
                    order = orderStatement.length > 0 ? orderStatement[0].object.label : Infinity;
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
                type,
                order
            });
        }

        // order featured comparison
        comparisons = comparisons.sort((c1, c2) => sortMethod(c1.order, c2.order));
        setComparisons(comparisons);
        setIsLoading(false);
    };

    useEffect(() => {
        getFeaturedComparisons();
    }, []);

    const [dropdownOpen, setOpen] = useState(false);

    const toggle = () => setOpen(!dropdownOpen);

    return (
        <div className="pl-3 pr-3 pt-2 pb-3">
            <div className="d-flex justify-content-end mb-2">
                <ButtonDropdown size="sm" isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle caret color="lightblue">
                        Featured
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem>Featured</DropdownItem>
                        <DropdownItem>Latest</DropdownItem>
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
                                    <p style={{ fontSize: '13px' }} className="text-muted">
                                        <Dotdotdot clamp={3}>{comparison.description}</Dotdotdot>
                                    </p>
                                </ListGroupItem>
                            ))}
                        </ListGroup>

                        <div className="text-center">
                            <Link to={ROUTES.FEATURED_COMPARISONS}>
                                <Button color="primary" className="mr-3" size="sm">
                                    View more
                                </Button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center">No features comparison found</div>
                )
            ) : (
                <div className="text-center">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
        </div>
    );
}
