import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { createPropertyAction as createProperty, getSuggestedProperties } from 'slices/statementBrowserSlice';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from 'constants/graphSettings';
import { createRef, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Col, Input, ListGroupItem } from 'reactstrap';

const PropertySuggestions = () => {
    const [filterValue, setFilterValue] = useState('');
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const store = useSelector(state => state);
    const suggestedProperties = useMemo(() => getSuggestedProperties(store, selectedResource), [store, selectedResource]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const ref = createRef(null);

    useEffect(() => {
        if (filterValue) {
            setFilteredSuggestions(suggestedProperties.filter(property => property.property.label.toLowerCase().includes(filterValue.toLowerCase())));
        } else {
            setFilteredSuggestions(suggestedProperties);
        }
    }, [filterValue, suggestedProperties]);

    useEffect(() => {
        setTimeout(() => {
            setIsOverflowing(ref?.current?.clientHeight < ref?.current?.scrollHeight);
        }, 50);
    }, [ref]);

    return (
        <Col lg="3">
            <div className="border rounded p-2 bg-light-lighter">
                <h3 className="mt-1 fw-bold h6 text-muted">Suggested properties</h3>
                <Input
                    type="text"
                    bsSize="sm"
                    placeholder="Filter..."
                    className="mt-3 mb-2"
                    value={filterValue}
                    onChange={e => setFilterValue(e.target.value)}
                />
                <div className="list-group" style={{ maxHeight: !isExpanded ? 400 : 5000, overflowY: 'auto' }} ref={ref}>
                    {filteredSuggestions.map((c, index) => (
                        <ListGroupItem
                            action
                            onClick={() => {
                                dispatch(
                                    createProperty({
                                        resourceId: selectedResource,
                                        existingPredicateId: c.property.id,
                                        label: c.property.label,
                                        isTemplate: false,
                                        createAndSelect: true,
                                    }),
                                );
                            }}
                            key={`suggested-property-${index}`}
                            className="py-2 px-3"
                            style={{ cursor: 'pointer' }}
                        >
                            <DescriptionTooltip id={c.property.id} typeId={ENTITIES.PREDICATE}>
                                <div className="d-flex">
                                    <div className="flex-grow-1" style={{ fontSize: '90%' }}>
                                        <Icon icon={faPlus} className="me-1 text-muted" /> {c.property.label}
                                    </div>
                                </div>
                            </DescriptionTooltip>
                        </ListGroupItem>
                    ))}
                    {filteredSuggestions.length === 0 && <div className="text-center fst-italic mt-2">No properties found</div>}
                </div>
                {(isOverflowing || isExpanded) && (
                    <div className="justify-content-center d-flex mt-2">
                        <Button color="link" size="sm" className="p-0" onClick={() => setIsExpanded(v => !v)}>
                            {isExpanded ? 'Hide' : 'Show'} all
                        </Button>
                    </div>
                )}
            </div>
        </Col>
    );
};

export default PropertySuggestions;
