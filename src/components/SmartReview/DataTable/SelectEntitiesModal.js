import { faMinusCircle, faPlusCircle, faSort } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { saveEntities, saveShowProperties } from 'actions/smartReview';
import arrayMove from 'array-move';
import capitalize from 'capitalize';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import { flattenDeep, uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableContainer, SortableElement, sortableHandle } from 'react-sortable-hoc';
import { Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getPredicate } from 'services/backend/predicates';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubject } from 'services/backend/statements';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const DragHandle = styled.div`
    cursor: move;
    color: #a5a5a5;
    width: 30px;
    text-align: center;
    flex-shrink: 0;
`;

const ListGroupItemStyled = styled(ListGroupItem)`
    padding: 10px 10px 9px 5px !important;
    display: flex !important;
`;

const SelectEntitiesModal = ({ toggle, section, type }) => {
    const comparisons = useSelector(state => state.smartReview.comparisons);
    const [selectedEntities, setSelectedEntities] = useState([]);
    const [suggestionEntities, setSuggestionEntities] = useState([]);
    const [suggestionProperties, setSuggestionProperties] = useState([]);
    const [addEntityType, setAddEntityType] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        const populateLists = async () => {
            if (type === 'entities') {
                // get all the properties used in the comparison (not the most elegant code..)
                setSuggestionEntities(
                    Object.values(comparisons).map(comparison => ({
                        title: comparison.metaData?.title ?? 'Nameless comparison',
                        properties: uniqBy(
                            flattenDeep(
                                Object.keys(comparison.data)
                                    .filter(property => comparison.properties.find(({ id }) => property === id).active)
                                    .map(property =>
                                        comparison.data[property].map(row =>
                                            row
                                                .map(value => ({
                                                    label: value.pathLabels?.[value.pathLabels?.length - 1],
                                                    id: value.path?.[value.path?.length - 1],
                                                    type: 'property'
                                                }))
                                                .filter(_property => _property.id)
                                        )
                                    )
                            ),
                            'id'
                        )
                    }))
                );

                setSelectedEntities(section.dataTable.entities);
                setSuggestionProperties([]);
            } else if (type === 'properties') {
                setSuggestionEntities([]);
                setSelectedEntities(section.dataTable.properties);
                setSuggestionProperties([await getPredicate(PREDICATES.DESCRIPTION), await getPredicate(PREDICATES.SAME_AS)]);
            }
        };
        populateLists();
    }, [comparisons, section.dataTable.entities, section.dataTable.properties, type]);

    const SortableHandle = sortableHandle(() => (
        <DragHandle>
            <Icon icon={faSort} />
        </DragHandle>
    ));

    const SortableItem = SortableElement(({ value: entity }) => (
        <ListGroupItemStyled className="py-2 d-flex justify-content-between">
            <div className="d-flex">
                <SortableHandle />
                {capitalize(entity.label)}
            </div>
            <Button color="link" className="p-0 ms-2" onClick={() => handleRemoveEntity(entity.id)}>
                <Icon icon={faMinusCircle} />
            </Button>
        </ListGroupItemStyled>
    ));

    const SortableList = SortableContainer(({ items }) => {
        return (
            <ListGroup>
                <ListGroupItemStyled className="font-weight-bold ps-2 py-2 bg-light">Selected {type}</ListGroupItemStyled>
                {items.map((value, index) => (
                    <SortableItem key={`item-${index}`} index={index} value={value} />
                ))}
                <ListGroupItemStyled className="py-2 d-flex justify-content-end">
                    {addEntityType ? (
                        <Autocomplete
                            entityType={addEntityType}
                            placeholder={`Enter a ${addEntityType === ENTITIES.PREDICATE ? 'property' : 'resource'}`}
                            onItemSelected={item => handleSelectEntity(item.id)}
                            onBlur={() => setAddEntityType(null)}
                            openMenuOnFocus={true}
                            cssClasses="form-control-sm"
                        />
                    ) : (
                        <>
                            <Button color="secondary" size="sm" onClick={() => setAddEntityType(ENTITIES.PREDICATE)}>
                                Add property
                            </Button>
                            {type === 'entities' && (
                                <Button color="secondary" size="sm" className="ms-2" onClick={() => setAddEntityType(ENTITIES.RESOURCE)}>
                                    Add resource
                                </Button>
                            )}
                        </>
                    )}
                </ListGroupItemStyled>
            </ListGroup>
        );
    });

    const handleSort = ({ oldIndex, newIndex }) => {
        setSelectedEntities(_entities => arrayMove(_entities, oldIndex, newIndex));
    };

    const handleSave = () => {
        if (type === 'entities') {
            dispatch(
                saveEntities({
                    sectionId: section.id,
                    entities: selectedEntities
                })
            );
        } else if (type === 'properties') {
            dispatch(
                saveShowProperties({
                    sectionId: section.id,
                    properties: selectedEntities
                })
            );
        }
        toggle();
    };

    const handleSelectEntity = async id => {
        try {
            const entity = addEntityType === ENTITIES.RESOURCE ? await getResource(id) : await getPredicate(id);
            const entityStatements = await getStatementsBySubject({ id });
            setSelectedEntities(_entities => [..._entities, { ...entity, statements: entityStatements }]);
            setAddEntityType(null);
        } catch (e) {
            toast.error('An error occurred, please reload the page and try again');
        }
    };

    const handleRemoveEntity = entityId => {
        setSelectedEntities(_entities => _entities.filter(_entity => _entity.id !== entityId));
    };

    const handleAddAllEntities = entities => entities.map(entity => handleSelectEntity(entity.id));

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Select {type}</ModalHeader>
            <ModalBody>
                <SortableList items={selectedEntities} onSortEnd={handleSort} lockAxis="y" helperClass="sortableHelper" useDragHandle />
                <h2 className="h5 mt-3">Suggestions</h2>

                {suggestionEntities.map((comparison, index) => {
                    const entities =
                        comparison?.properties?.filter(entity => selectedEntities.filter(item => item.id === entity.id).length === 0) ?? [];
                    return (
                        <ListGroup className="mt-3" key={index}>
                            <ListGroupItemStyled className="bg-light ps-2 py-2 d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="font-weight-bold me-2">Comparison</span> {comparison.title}
                                </div>
                                {entities.length > 0 && (
                                    <Button color="secondary" size="sm" className="flex-shrink-0" onClick={() => handleAddAllEntities(entities)}>
                                        Add all
                                    </Button>
                                )}
                            </ListGroupItemStyled>
                            {entities.map(suggestion => (
                                <ListGroupItem key={suggestion.id} className="py-2">
                                    <Button color="link" className="p-0 me-2" onClick={() => handleSelectEntity(suggestion.id)}>
                                        <Icon icon={faPlusCircle} />
                                    </Button>
                                    {capitalize(suggestion.label)}
                                </ListGroupItem>
                            ))}
                            {entities.length === 0 && <ListGroupItem className="py-2 text-muted text-center">No suggestions available</ListGroupItem>}
                        </ListGroup>
                    );
                })}

                {suggestionProperties.length > 0 && (
                    <ListGroup className="mt-3">
                        {suggestionProperties
                            .filter(property => selectedEntities.filter(item => item.id === property.id).length === 0)
                            .map(suggestion => (
                                <ListGroupItem key={suggestion.id} className="py-2">
                                    <Button color="link" className="p-0 me-2" onClick={() => handleSelectEntity(suggestion.id)}>
                                        <Icon icon={faPlusCircle} />
                                    </Button>
                                    {capitalize(suggestion.label)}
                                </ListGroupItem>
                            ))}
                    </ListGroup>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

SelectEntitiesModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    section: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired
};

export default SelectEntitiesModal;
