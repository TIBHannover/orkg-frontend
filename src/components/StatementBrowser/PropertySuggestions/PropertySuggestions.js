import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getSuggestedProperties, createProperty } from 'actions/statementBrowser';
import { useSelector, useDispatch } from 'react-redux';

const PropertySuggestions = () => {
    const dispatch = useDispatch();
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));

    return (
        <>
            <p className="text-muted mt-4">Suggested properties</p>
            <ListGroup>
                {suggestedProperties.map((c, index) => (
                    <ListGroupItem key={`suggested-property-${index}`}>
                        <StatementOptionButton
                            className="mr-2"
                            title="Add property"
                            icon={faPlus}
                            action={() => {
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
                        />
                        {c.property.label}
                        <Badge pill className="ml-2">
                            {c.value?.label ?? ''}
                        </Badge>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </>
    );
};

export default PropertySuggestions;
