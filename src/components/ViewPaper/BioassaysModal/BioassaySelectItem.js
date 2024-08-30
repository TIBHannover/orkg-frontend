import Link from 'next/link';
import { Label, ListGroup, Alert, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle, ValueItemStyle } from 'components/StatementBrowser/styled';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

export default function BioassaySelectItem(props) {
    return (
        <>
            <div className="mb-3">
                <Alert color="info">Please select specific items that you want to include in the contribution data</Alert>
            </div>
            <ListGroup className="listGroupEnlarge">
                <div>
                    {props.data.labels.map((labelKey) => (
                        <StatementsGroupStyle key={`p${labelKey.property.id}`} className="noTemplate">
                            <div className="row g-0">
                                <PropertyStyle className="col-4" tabIndex="0">
                                    <div className="propertyLabel">
                                        <Label className=" mr-2">
                                            <Link className="text-dark" target="_blank" href={reverse(ROUTES.PROPERTY, { id: labelKey.property.id })}>
                                                {labelKey.property.label}
                                            </Link>
                                        </Label>
                                    </div>
                                </PropertyStyle>
                                <ValuesStyle className="col-8 valuesList">
                                    <ListGroup flush className="px-3">
                                        {labelKey.resources.map((resource) => (
                                            <ValueItemStyle key={`p${resource.id}`} className="suggested_value d-flex">
                                                <div className="flex-grow-1">
                                                    <Label>
                                                        <Link target="_blank" href={`${reverse(ROUTES.RESOURCE, { id: resource.id })}?noRedirect`}>
                                                            {resource.label}
                                                        </Link>
                                                    </Label>
                                                </div>
                                                <div>
                                                    <Input
                                                        type="checkbox"
                                                        onChange={(e) => props.handleSelect(labelKey, resource)}
                                                        checked={!!props.selectedItems?.[labelKey.property.id]?.includes(resource.id)}
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
