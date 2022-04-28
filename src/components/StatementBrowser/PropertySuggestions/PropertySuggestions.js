import { ListGroup, ListGroupItem, Badge, Col } from 'reactstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { getSuggestedProperties, createPropertyAction as createProperty } from 'slices/statementBrowserSlice';
import { useSelector, useDispatch } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';

const PropertySuggestions = () => {
    const dispatch = useDispatch();
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));

    return (
        <Col lg="12">
            <p className="text-muted mt-4">Suggested properties</p>
            <ListGroup>
                {suggestedProperties.map((c, index) => (
                    <ListGroupItem
                        action
                        onClick={() => {
                            dispatch(
                                createProperty({
                                    resourceId: selectedResource,
                                    existingPredicateId: c.property.id,
                                    label: c.property.label,
                                    isTemplate: false,
                                    createAndSelect: true
                                })
                            );
                        }}
                        key={`suggested-property-${index}`}
                        className="py-2 px-3"
                        style={{ cursor: 'pointer' }}
                    >
                        <DescriptionTooltip id={c.property.id} typeId={ENTITIES.PREDICATE}>
                            <div className="d-flex">
                                <div className="flex-grow-1">
                                    <Icon icon={faPlus} className="me-1 text-muted" /> {c.property.label}
                                </div>
                                <small className="float-end">
                                    <Badge pill className="ms-2">
                                        {c.value?.label ?? ''}
                                    </Badge>
                                </small>
                            </div>
                        </DescriptionTooltip>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </Col>
    );
};

export default PropertySuggestions;
