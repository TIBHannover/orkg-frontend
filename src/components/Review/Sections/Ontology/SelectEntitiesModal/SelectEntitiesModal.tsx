import { faPlusCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import capitalize from 'capitalize';
import { uniqBy } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import useSWR from 'swr';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { flattenPaths } from '@/components/Comparison/hooks/useComparison';
import useReview from '@/components/Review/hooks/useReview';
import EntityListItem, { isEntityData } from '@/components/Review/Sections/Ontology/SelectEntitiesModal/EntityListItem';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import ListGroup from '@/components/Ui/List/ListGroup';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { comparisonUrl, getComparison, getComparisonContents } from '@/services/backend/comparisons';
import { getPredicate } from '@/services/backend/predicates';
import { getStatements } from '@/services/backend/statements';
import { getThing } from '@/services/backend/things';
import { ReviewSection, ReviewSectionData } from '@/services/backend/types';

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
    const [pendingEntityIds, setPendingEntityIds] = useState<string[]>([]);
    const [suggestionEntities, setSuggestionEntities] = useState<
        {
            title: string;
            properties: Entity[];
        }[]
    >([]);
    const [suggestionProperties, setSuggestionProperties] = useState<Omit<ReviewSectionData, 'classes'>[]>([]);
    const [instanceId] = useState(() => createInstanceId('select-entities-modal'));
    const [autocompleteKey, setAutocompleteKey] = useState(0);
    const [selectionMessage, setSelectionMessage] = useState<string | null>(null);

    const { review, updateSection } = useReview();
    const comparisonIds = review?.sections
        .filter((_section) => _section.type === 'comparison' && _section.comparison?.id)
        .map((_section) => _section.comparison!.id);

    const { data: comparisons } = useSWR(
        comparisonIds && comparisonIds.length > 0 ? [comparisonIds, comparisonUrl, 'getComparison'] : null,
        ([ids]) => Promise.all(ids.map((id) => getComparison(id))),
    );
    const { data: comparisonContents } = useSWR(
        comparisonIds && comparisonIds.length > 0 ? [comparisonIds, comparisonUrl, 'getComparisonContents'] : null,
        ([ids]) => Promise.all(ids.map((id) => getComparisonContents(id))),
    );

    const itemTypeLabel = type === 'properties' ? 'property' : 'entity';
    const itemTypeLabelPlural = type === 'properties' ? 'Properties' : 'Entities';

    const getDuplicateSelectionMessage = (label?: string) =>
        `${
            label ? `"${label}"` : `This ${itemTypeLabel}`
        } is already selected or being added. ${itemTypeLabelPlural} are unique by ID and can only be added once.`;

    useEffect(() => {
        const populateLists = async () => {
            setSelectionMessage(null);
            if (type === 'entities') {
                if (comparisons) {
                    setSuggestionEntities(
                        comparisons.map((comparison, index) => ({
                            title: comparison.title ?? 'Nameless comparison',
                            properties: uniqBy(
                                flattenPaths(comparisonContents?.[index].selected_paths ?? []).map((path) => ({
                                    label: path.label,
                                    id: path.id,
                                    type: 'property',
                                })),
                                'id',
                            ),
                        })),
                    );
                }
                setSelectedEntities(uniqBy(section.entities ?? [], 'id'));
                setSuggestionProperties([]);
            } else if (type === 'properties') {
                setSuggestionEntities([]);
                setSelectedEntities(uniqBy(section.predicates ?? [], 'id'));
                setSuggestionProperties(uniqBy([await getPredicate(PREDICATES.DESCRIPTION), await getPredicate(PREDICATES.SAME_AS)], 'id'));
            }
        };
        populateLists();
    }, [comparisonContents, comparisons, section, type]);

    const handleSelectEntity = async (id: string, options?: { label?: string }) => {
        const { label } = options ?? {};
        if (selectedEntities.some((entity) => entity.id === id) || pendingEntityIds.includes(id)) {
            const existingEntity = selectedEntities.find((entity) => entity.id === id);
            setSelectionMessage(getDuplicateSelectionMessage(label ?? existingEntity?.label));
            setAutocompleteKey((prev) => prev + 1);
            return;
        }
        // Mark as loading immediately
        setPendingEntityIds((prev) => [...prev, id]);

        try {
            // Use specific API calls based on section type to maintain type consistency
            const [entity, entityStatements] = await Promise.all([
                type === 'properties' ? getPredicate(id) : getThing(id),
                getStatements({ subjectId: id }),
            ]);
            setSelectedEntities((_entities) => {
                if (_entities.some((_entity) => _entity.id === id)) {
                    return _entities;
                }
                return [..._entities, { ...entity, statements: entityStatements }];
            });
            setSelectionMessage(null);
            setAutocompleteKey((prev) => prev + 1);
        } catch (e) {
            toast.error('An error occurred, please reload the page and try again');
        } finally {
            // Always remove loading state, even on error
            setPendingEntityIds((prev) => prev.filter((entityId) => entityId !== id));
        }
    };

    const handleRemoveEntity = (entityId: string) => {
        setSelectionMessage(null);
        setSelectedEntities((_entities) => _entities.filter((_entity) => _entity.id !== entityId));
    };

    const handleAddAllEntities = (entities: Entity[]) => entities.forEach((entity) => handleSelectEntity(entity.id, { label: entity.label }));

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
                    {pendingEntityIds.length > 0 && (
                        <ListGroupItem className="py-2 text-muted text-center">
                            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                            Adding selected item...
                        </ListGroupItem>
                    )}
                    <ListGroupItemStyled className="py-2 d-flex justify-content-end">
                        <Autocomplete
                            key={autocompleteKey}
                            placeholder={type === 'properties' ? 'Enter a property' : 'Enter a property or resource'}
                            entityType={type === 'properties' ? ENTITIES.PREDICATE : ENTITIES.THING}
                            onChange={(value, { action }) => {
                                if (action === 'select-option' && value?.id) {
                                    handleSelectEntity(value.id, {
                                        label: value.label,
                                    });
                                }
                            }}
                            openMenuOnFocus
                            size="sm"
                            allowCreate={false}
                            excludeClasses={type === 'entities' ? ['Literal', 'Class'] : undefined}
                        />
                    </ListGroupItemStyled>
                </ListGroup>
                {selectionMessage && (
                    <Alert color="info" fade={false} className="mt-3 mb-0">
                        {selectionMessage}
                    </Alert>
                )}
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
                                    <Button
                                        color="link"
                                        className="p-0 me-2"
                                        onClick={() => handleSelectEntity(suggestion.id, { label: suggestion.label })}
                                    >
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
                                    <Button
                                        color="link"
                                        className="p-0 me-2"
                                        onClick={() => handleSelectEntity(suggestion.id, { label: suggestion.label })}
                                    >
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
