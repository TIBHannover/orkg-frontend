import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { getSuggestedProperties, createProperty } from 'actions/statementBrowser';
import { useSelector, useDispatch } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';

const PropertySuggestions = () => {
    const dispatch = useDispatch();
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));

    return (
        <>
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
                        style={{ cursor: 'pointer' }}
                    >
                        <DescriptionTooltip id={c.property.id} typeId={ENTITIES.PREDICATE} key={`suggested-property-${index}`}>
                            <Icon icon={faPlus} className="mr-1 text-muted" /> {c.property.label}
                            <Badge pill className="ml-2">
                                {c.value?.label ?? ''}
                            </Badge>
                        </DescriptionTooltip>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </>
    );
};

export default PropertySuggestions;
