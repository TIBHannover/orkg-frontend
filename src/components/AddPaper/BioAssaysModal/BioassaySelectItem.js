import { Label, ListGroup, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle, ValueItemStyle } from 'components/StatementBrowser/styled';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

export default function BioassaySelectItem(props) {
    return (
        <>
            <div className="mb-3">
                <Alert>Please select specific items that you want to include in the contribution data</Alert>
            </div>
            <ListGroup className="listGroupEnlarge">
                <div>
                    {Object.keys(props.data.labels).map(labelKey => (
                        <StatementsGroupStyle key={`p${props.data.properties[labelKey]}`} className="noTemplate">
                            <div className="row g-0">
                                <PropertyStyle className="col-4" tabIndex="0">
                                    <div className="propertyLabel">
                                        <Label className=" mr-2">
                                            <Link
                                                className="text-dark"
                                                target="_blank"
                                                to={reverse(ROUTES.PROPERTY, { id: props.data.properties[labelKey] })}
                                            >
                                                {labelKey}
                                            </Link>
                                        </Label>
                                    </div>
                                </PropertyStyle>
                                <ValuesStyle className="col-8 valuesList">
                                    <ListGroup flush className="px-3">
                                        {props.data.labels[labelKey].map(value => (
                                            <ValueItemStyle key={`p${props.data.resources[value]}`} className="suggested_value d-flex">
                                                <div className="flex-grow-1">
                                                    <Label>
                                                        <Link target="_blank" to={reverse(ROUTES.RESOURCE, { id: props.data.resources[value] })}>
                                                            {value}
                                                        </Link>
                                                    </Label>
                                                </div>
                                                <div>
                                                    <input
                                                        type="checkbox"
                                                        onChange={e => props.handleSelect(labelKey, value)}
                                                        checked={!!props.selectedItems?.[labelKey]?.includes(value)}
                                                    />
                                                </div>
                                            </ValueItemStyle>
                                        ))}
                                    </ListGroup>
                                </ValuesStyle>
                            </div>
                        </StatementsGroupStyle>
                    ))}
                </div>
            </ListGroup>
        </>
    );
}

BioassaySelectItem.propTypes = {
    data: PropTypes.object.isRequired,
    selectedItems: PropTypes.object.isRequired,
    handleSelect: PropTypes.func.isRequired,
};
