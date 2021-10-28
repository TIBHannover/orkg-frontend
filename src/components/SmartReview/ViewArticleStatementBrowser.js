import { PropertyStyle, StatementsGroupStyle, ValueItemStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import ROUTES from 'constants/routes';
import { orderBy } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ListGroup } from 'reactstrap';

/**
 * This components looks similar to the statement browser, but it doesn't have any of its functionality
 * Is used to render the statement browser from an array of statements (thus there is no backend communication)
 */
const ViewArticleStatementBrowser = ({ id }) => {
    const [properties, setProperties] = useState([]);
    const statements = useSelector(state => state.smartReview.statements);

    useEffect(() => {
        const statementsForSubject = statements.filter(statement => statement.subject.id === id);

        let properties = {};
        for (const statement of statementsForSubject) {
            if (!(statement.predicate.id in properties)) {
                properties[statement.predicate.id] = statement.predicate;
                properties[statement.predicate.id].values = [];
            }
            properties[statement.predicate.id].values.push(statement.object);
        }

        for (const propertyId in properties) {
            const property = properties[propertyId];
            properties[propertyId] = {
                ...property,
                values: orderBy(property.values, [_property => _property.label.toLowerCase()])
            };
        }

        properties = orderBy(properties, [property => property.label.toLowerCase()]);
        setProperties(properties);
    }, [statements, id]);

    return (
        <ListGroup className="listGroupEnlarge">
            {Object.keys(properties).map(propertyId => {
                const property = properties[propertyId];
                return (
                    <StatementsGroupStyle className="noTemplate list-group-item" key={propertyId}>
                        <div className="row no-gutters">
                            <PropertyStyle className="col-4" tabIndex="0">
                                <div>
                                    <div className="propertyLabel">
                                        <Link to={reverse(ROUTES.PROPERTY, { id: property.id })} target="_blank">
                                            {property.label}
                                        </Link>
                                    </div>
                                </div>
                            </PropertyStyle>
                            <ValuesStyle className="col-8 valuesList">
                                <ListGroup flush className="px-3">
                                    {property.values.length > 0 &&
                                        property.values.map(value => (
                                            <ValueItemStyle key={value.id}>
                                                {value._class === 'resource' ? (
                                                    <Link to={reverse(ROUTES.RESOURCE, { id: value.id })}>{value.label}</Link>
                                                ) : (
                                                    value.label
                                                )}
                                            </ValueItemStyle>
                                        ))}
                                    {property.values === 0 && (
                                        <div className="pt-2">
                                            <small>No values</small>
                                        </div>
                                    )}
                                </ListGroup>
                            </ValuesStyle>
                        </div>
                    </StatementsGroupStyle>
                );
            })}
        </ListGroup>
    );
};

ViewArticleStatementBrowser.propTypes = {
    id: PropTypes.string.isRequired
};

export default ViewArticleStatementBrowser;
