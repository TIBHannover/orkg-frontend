import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import { PropertyStyle, StatementsGroupStyle, ValueItemStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import { getConfigByType } from 'constants/DataTypes';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Badge, ListGroup } from 'reactstrap';

const ListStatements = ({ property, idToLabel, values, validationErrors = [] }) => (
    <StatementsGroupStyle className="list-group-item" style={{ marginBottom: -1 }}>
        <div className="row gx-0">
            <PropertyStyle className="col-4" tabIndex="0">
                <div>
                    <span className="propertyLabel">
                        {idToLabel[property] ? (
                            <Link href={reverse(ROUTES.PROPERTY, { id: property })} target="_blank">
                                {idToLabel[property]}
                            </Link>
                        ) : (
                            <Tooltip content="A new property will be created">
                                <span>{property}</span>
                            </Tooltip>
                        )}
                    </span>
                </div>
            </PropertyStyle>
            <ValuesStyle className="col-8 valuesList">
                <ListGroup flush className="px-3" style={{ listStyle: 'inside' }}>
                    {values.map((value, i) => (
                        <ValueItemStyle style={{ display: 'list-item' }} key={i}>
                            <div className="d-inline">
                                {'id' in value && idToLabel[value.id] && (
                                    <>
                                        <Link href={`${reverse(ROUTES.RESOURCE, { id: value.id })}?noRedirect`} target="_blank">
                                            {idToLabel[value.id]}
                                        </Link>
                                        <Badge color="light" className="ms-2">
                                            Resource
                                        </Badge>
                                    </>
                                )}
                                {value.label && (
                                    <Tooltip content="A new resource will be created">
                                        <span>
                                            <span className="text-primary">{value.label}</span>
                                            <Badge color="light" className="ms-2">
                                                Resource
                                            </Badge>
                                        </span>
                                    </Tooltip>
                                )}
                                {value.text && (
                                    <>
                                        {value.text}
                                        <Badge color="light" className="ms-2">
                                            {getConfigByType(value.datatype).name}
                                        </Badge>
                                        {validationErrors?.[i] && (
                                            <Tooltip content="The provided datatype does not seem to match the cell value">
                                                <span>
                                                    <Badge color="warning" className="ms-2">
                                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-white" /> Warning
                                                    </Badge>
                                                </span>
                                            </Tooltip>
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
