import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import capitalize from 'capitalize';
import { flattenDeep, uniqBy } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import styled from 'styled-components';
import useSWR from 'swr';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import useReview from '@/components/Review/hooks/useReview';
import EntityListItem, { isEntityData } from '@/components/Review/Sections/Ontology/SelectEntitiesModal/EntityListItem';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { comparisonUrl, getComparison } from '@/services/backend/comparisons';
import { getPredicate } from '@/services/backend/predicates';
import { getResource } from '@/services/backend/resources';
import { getStatements } from '@/services/backend/statements';
import { EntityType, ReviewSection, ReviewSectionData } from '@/services/backend/types';

const ListGroupItemStyled = styled(ListGroupItem)`
    padding: 10px 10px 9px 5px !important;
    display: flex !important;
`;

type SelectEntitiesModalProps = {
    toggle: () => void;
    section: ReviewSection;
    type: 'entities' | 'properties' | null;
};

type Entity = {
    label: string;
    id: string;
    type: string;
};

const SelectEntitiesModal: FC<SelectEntitiesModalProps> = ({ toggle, section, type }) => {
    const [selectedEntities, setSelectedEntities] = useState<ReviewSectionData[] | Omit<ReviewSectionData, 'classes'>[]>([]);
    const [suggestionEntities, setSuggestionEntities] = useState<
        {
            title: string;
            properties: Entity[];
        }[]
    >([]);
    const [suggestionProperties, setSuggestionProperties] = useState<Omit<ReviewSectionData, 'classes'>[]>([]);
    const [addEntityType, setAddEntityType] = useState<EntityType | null>(null);
    const [instanceId] = useState(() => createInstanceId('select-entities-modal'));

    const { review, updateSection } = useReview();
    const comparisonIds = review?.sections
        .filter((_section) => _section.type === 'comparison' && _section.comparison?.id)
        .map((_section) => _section.comparison!.id);

    const { data: comparisons } = useSWR(
        comparisonIds && comparisonIds.length > 0 ? [comparisonIds, comparisonUrl, 'getComparison'] : null,
        ([ids]) => Promise.all(ids.map((id) => getComparison(id))),
    );

    useEffect(() => {
        const populateLists = async () => {
            if (type === 'entities') {
                if (comparisons) {
                    setSuggestionEntities(
                        comparisons.map((comparison) => ({
                            title: comparison.title ?? 'Nameless comparison',
                            properties: uniqBy(
                                flattenDeep(
                                    Object.keys(comparison.data.data)
                                        .filter((property) => comparison.data.predicates.find(({ id }) => property === id)?.active)
                                        .map((property) =>
                                            comparison.data.data[property].map((row) =>
                                                row
                                                    .map((value) => ({
                                                        label: value.path_labels?.[value.path_labels.length - 1],
                                                        id: value.path?.[value.path.length - 1],
                                                        type: 'property',
                                                    }))
                                                    .filter((_property) => _property.id),
                                            ),
                                        ),
                                ),
                                'id',
                            ),
                        })),
                    );
                }
                setSelectedEntities(section.entities!);
                setSuggestionProperties([]);
            } else if (type === 'properties') {
                setSuggestionEntities([]);
                setSelectedEntities(section.predicates!);
                setSuggestionProperties([await getPredicate(PREDICATES.DESCRIPTION), await getPredicate(PREDICATES.SAME_AS)]);
            }
        };
        populateLists();
    }, [comparisons, section, type]);

    const handleSelectEntity = async (id: string) => {
        try {
            const entity = addEntityType === ENTITIES.RESOURCE ? await getResource(id) : await getPredicate(id);
            const entityStatements = await getStatements({ subjectId: id });
            setSelectedEntities((_entities) => [..._entities, { ...entity, statements: entityStatements }]);
            setAddEntityType(null);
        } catch (e) {
            toast.error('An error occurred, please reload the page and try again');
        }
    };

    const handleRemoveEntity = (entityId: string) => {
        setSelectedEntities((_entities) => _entities.filter((_entity) => _entity.id !== entityId));
    };

    const handleAddAllEntities = (entities: Entity[]) => entities.map((entity) => handleSelectEntity(entity.id));

    const reorderEntities = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            const reorderedEntities = performReorder({
                items: selectedEntities,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (reorderedEntities !== selectedEntities) {
                setSelectedEntities(reorderedEntities);
            }
        },
        [selectedEntities],
    );

    useEffect(() => {
        const cleanup = createListMonitor({
            instanceId,
            items: selectedEntities,
            isDragData: isEntityData,
            onReorder: reorderEntities,
            getItemId: (entity) => entity.id,
        });

        return () => {
            cleanup?.();
        };
    }, [instanceId, selectedEntities, reorderEntities]);

    const handleSave = () => {
        updateSection(section.id, {
            entities: type === 'entities' ? selectedEntities.map((entity) => entity.id) : section.entities?.map(({ id }) => id),
            predicates: type === 'properties' ? selectedEntities.map((entity) => entity.id) : section.predicates?.map(({ id }) => id),
            heading: section.heading,
        });
        toggle();
    };

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Select {type}</ModalHeader>
            <ModalBody>
                <ListGroup>
                    <ListGroupItemStyled className="font-weight-bold ps-2 py-2 bg-light">Selected {type}</ListGroupItemStyled>
                    {selectedEntities.map((entity, index) => (
                        <EntityListItem
                            key={entity.id}
                            entity={entity}
                            index={index}
                            instanceId={instanceId}
                            onRemove={handleRemoveEntity}
                            totalItems={selectedEntities.length}
                        />
                    ))}
                    <ListGroupItemStyled className="py-2 d-flex justify-content-end">
                        {addEntityType ? (
                            <Autocomplete
                                entityType={addEntityType}
                                placeholder={`Enter a ${addEntityType === ENTITIES.PREDICATE ? 'property' : 'resource'}`}
                                onChange={(value, { action }) => {
                                    if (action === 'select-option' && value?.id) {
                                        handleSelectEntity(value.id);
                                    }
                                }}
                                openMenuOnFocus
                                size="sm"
                                allowCreate={false}
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
                <h2 className="h5 mt-3">Suggestions</h2>

                {suggestionEntities.map((comparison, index) => {
                    const entities =
                        comparison?.properties?.filter((entity) => selectedEntities.filter((item) => item.id === entity.id).length === 0) ?? [];
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
                            {entities.map((suggestion) => (
                                <ListGroupItem key={suggestion.id} className="py-2">
                                    <Button color="link" className="p-0 me-2" onClick={() => handleSelectEntity(suggestion.id)}>
                                        <FontAwesomeIcon icon={faPlusCircle} />
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
                            .filter((property) => selectedEntities.filter((item) => item.id === property.id).length === 0)
                            .map((suggestion) => (
                                <ListGroupItem key={suggestion.id} className="py-2">
                                    <Button color="link" className="p-0 me-2" onClick={() => handleSelectEntity(suggestion.id)}>
                                        <FontAwesomeIcon icon={faPlusCircle} />
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

export default SelectEntitiesModal;
