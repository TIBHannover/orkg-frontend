import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { PropertyStyle, StatementsGroupStyle, ValueItemStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import { getConfigByType } from 'constants/DataTypes';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Badge, ListGroup } from 'reactstrap';

const ListStatements = ({ property, idToLabel, values, validationErrors = [] }) => (
    <StatementsGroupStyle className="list-group-item" style={{ marginBottom: -1 }}>
        <div className="row gx-0">
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
                                    <>
                                        <Link
                                            to={reverse(ROUTES.RESOURCE, {
                                                id: value['@id'],
                                            })}
                                            target="_blank"
                                        >
                                            {idToLabel[value['@id']]}
                                        </Link>
                                        <Badge color="light" className="ms-2">
                                            Resource
                                        </Badge>
                                    </>
                                )}
                                {value.label && (
                                    <Tippy content="A new resource will be created">
                                        <span>
                                            <span className="text-primary">{value.label}</span>
                                            <Badge color="light" className="ms-2">
                                                Resource
                                            </Badge>
                                        </span>
                                    </Tippy>
                                )}
                                {value.text && (
                                    <>
                                        {value.text}
                                        <Badge color="light" className="ms-2">
                                            {getConfigByType(value.datatype).name}
                                        </Badge>
                                        {validationErrors?.[i] && (
                                            <Tippy content="The provided datatype does not seem to match the cell value">
                                                <span>
                                                    <Badge color="warning" className="ms-2">
                                                        <Icon icon={faExclamationTriangle} className="text-white" /> Warning
                                                    </Badge>
                                                </span>
                                            </Tippy>
                                        )}
                                    </>
                                )}
                            </div>
                        </ValueItemStyle>
                    ))}
                </ListGroup>
            </ValuesStyle>
        </div>
    </StatementsGroupStyle>
);

ListStatements.propTypes = {
    property: PropTypes.string.isRequired,
    idToLabel: PropTypes.object.isRequired,
    values: PropTypes.array.isRequired,
    validationErrors: PropTypes.array,
};

export default ListStatements;
