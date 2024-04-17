import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ListGroupItem } from 'reactstrap';
import { createPropertyAction as createProperty, getSuggestedProperties } from 'slices/statementBrowserSlice';

const PROPERTIES_LIMIT = 3;

const PropertySuggestions = ({ selectedResource }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const suggestedProperties = useMemo(() => getSuggestedProperties(store, selectedResource), [store, selectedResource]);
    const [isExpanded, setIsExpanded] = useState(false);

    const filteredSuggestions = isExpanded ? suggestedProperties : suggestedProperties.slice(0, PROPERTIES_LIMIT);

    if (filteredSuggestions.length === 0) {
        return null;
    }

    return (
        <div className="border border-top-0 p-2 bg-light-lighter">
            <h3 className="mt-1 h6 text-muted">Suggested properties</h3>
            <div className="list-group" style={{ maxHeight: !isExpanded ? 400 : 5000, overflowY: 'auto' }}>
                {filteredSuggestions.map((c) => (
                    <ListGroupItem
                        action
                        onClick={() => {
                            dispatch(
                                createProperty({
                                    resourceId: selectedResource,
                                    existingPredicateId: c.path.id,
                                    label: c.path.label,
                                    isTemplate: false,
                                    createAndSelect: true,
                                }),
                            );
                        }}
                        key={`suggested-property-${c.path.id}`}
                        className="py-2 px-3"
                        style={{ cursor: 'pointer' }}
                    >
                        <DescriptionTooltip id={c.path.id} _class={ENTITIES.PREDICATE}>
                            <div className="d-flex">
                                <div className="flex-grow-1" style={{ fontSize: '90%' }}>
                                    <Icon icon={faPlus} className="me-1 text-muted" /> {c.path.label}
                                </div>
                            </div>
                        </DescriptionTooltip>
                    </ListGroupItem>
                ))}
                {filteredSuggestions.length === 0 && <div className="text-center fst-italic mt-2">No properties found</div>}
            </div>
            {suggestedProperties.length > PROPERTIES_LIMIT && (
                <div className="justify-content-center d-flex mt-2">
                    <Button color="link" size="sm" className="p-0" onClick={() => setIsExpanded((v) => !v)}>
                        {isExpanded ? 'Hide' : 'Show'} all
                    </Button>
                </div>
            )}
        </div>
    );
};

PropertySuggestions.propTypes = {
    selectedResource: PropTypes.string.isRequired,
};

export default PropertySuggestions;
