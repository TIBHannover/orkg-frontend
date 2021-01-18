import { ListGroup } from 'reactstrap';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import Tippy from '@tippy.js/react';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle, ValueItemStyle } from 'components/StatementBrowser/styled';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ListStatements = props => {
    const { property, idToLabel, values } = props;

    return (
        <StatementsGroupStyle className="border-top">
            <div className="row no-gutters">
                <PropertyStyle className="col-4" tabIndex="0">
                    <div>
                        <span className="propertyLabel">
                            {idToLabel[property] ? (
                                <Link to={reverse(ROUTES.PROPERTY, { id: property })} target="_blank">
                                    {idToLabel[property]}
                                </Link>
                            ) : (
                                <Tippy content="A new property will be created">
                                    <span>{property}</span>
                                </Tippy>
                            )}
                        </span>
                    </div>
                </PropertyStyle>
                <ValuesStyle className="col-8 valuesList">
                    <ListGroup flush className="px-3" style={{ listStyle: 'inside' }}>
                        {values.map((value, i) => (
                            <ValueItemStyle style={{ display: 'list-item' }} key={i}>
                                <div className="d-inline">
                                    {'@id' in value && idToLabel[value['@id']] && (
                                        <Link
                                            to={reverse(ROUTES.RESOURCE, {
                                                id: value['@id']
                                            })}
                                            target="_blank"
                                        >
                                            {idToLabel[value['@id']]}
                                        </Link>
                                    )}
                                    {value.label && (
                                        <Tippy content="A new resource will be created">
                                            <span className="text-primary">{value.label}</span>
                                        </Tippy>
                                    )}
                                    {value.text}
                                </div>
                            </ValueItemStyle>
                        ))}
                    </ListGroup>
                </ValuesStyle>
            </div>
        </StatementsGroupStyle>
    );
};

ListStatements.propTypes = {
    property: PropTypes.string.isRequired,
    idToLabel: PropTypes.object.isRequired,
    values: PropTypes.array.isRequired
};

export default ListStatements;
