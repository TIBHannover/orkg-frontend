import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, ListGroup, ListGroupItem } from 'reactstrap';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { createProperty, getSuggestedProperties } from '@/slices/contributionEditorSlice';

const PropertySuggestions = () => {
    const dispatch = useDispatch();
    const suggestedProperties = useSelector((state) => getSuggestedProperties(state));

    return (
        <>
            {suggestedProperties?.length > 0 && (
                <>
                    <p className="text-muted mt-4">Suggested properties</p>
                    <ListGroup>
                        {suggestedProperties.map((c, index) => (
                            <ListGroupItem
                                action
                                onClick={() => {
                                    dispatch(
                                        createProperty({
                                            id: c.path.id,
                                            label: c.path.label,
                                            action: 'select-option',
                                        }),
                                    );
                                }}
                                key={`suggested-property-${index}`}
                                className="py-2 px-3"
                                style={{ cursor: 'pointer' }}
                            >
                                <DescriptionTooltip id={c.path.id} _class={ENTITIES.PREDICATE}>
                                    <div className="d-flex">
                                        <div className="flex-grow-1">
                                            <FontAwesomeIcon icon={faPlus} className="me-1 text-muted" /> {c.path.label}
                                        </div>
                                        <small className="float-end">
                                            <Badge pill className="ms-2">
                                                {(c.class?.label || c.datatype?.label) ?? ''}
                                            </Badge>
                                        </small>
                                    </div>
                                </DescriptionTooltip>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </>
            )}
        </>
    );
};

export default PropertySuggestions;
