import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal, Spinner, toast } from '@heroui/react';
import capitalize from 'capitalize';
import { uniqBy } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { flattenPaths } from '@/components/Comparison/hooks/useComparison';
import useReview from '@/components/Review/hooks/useReview';
import EntityListItem, { isEntityData } from '@/components/Review/Sections/Ontology/SelectEntitiesModal/EntityListItem';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { comparisonUrl, getComparison, getComparisonContents } from '@/services/backend/comparisons';
import { getPredicate } from '@/services/backend/predicates';
import { getStatements } from '@/services/backend/statements';
import { getThing } from '@/services/backend/things';
import { ReviewSection, ReviewSectionData } from '@/services/backend/types';

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

const LIST_BASE =
    'm-0 flex w-full flex-col list-none divide-y divide-default-200 overflow-hidden rounded-[var(--radius)] border border-default-200 bg-surface p-0';
const ROW_BASE = 'flex items-center text-foreground';

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
        setPendingEntityIds((prev) => [...prev, id]);

        try {
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
            toast.danger('An error occurred, please reload the page and try again');
        } finally {
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
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg" className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Select {type}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="space-y-4">
                        <ul className={LIST_BASE}>
                            <li className={`${ROW_BASE} bg-default-100 px-2 py-2 font-bold`}>Selected {type}</li>
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
                                <li className={`${ROW_BASE} justify-center gap-2 px-2 py-2 text-muted`}>
                                    <Spinner size="sm" />
                                    Adding selected item...
                                </li>
                            )}
                            <li className={`${ROW_BASE} px-2 py-2`}>
                                <div className="w-full">
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
                                </div>
                            </li>
                        </ul>

                        {selectionMessage && (
                            <Alert status="accent">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Already selected</Alert.Title>
                                    <Alert.Description>{selectionMessage}</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}

                        <h2 className="text-lg font-semibold mt-3">Suggestions</h2>

                        {suggestionEntities.map((comparison, index) => {
                            const entities =
                                comparison?.properties?.filter((entity) => selectedEntities.filter((item) => item.id === entity.id).length === 0) ??
                                [];
                            return (
                                // eslint-disable-next-line react/no-array-index-key
                                <ul key={index} className={LIST_BASE}>
                                    <li className={`${ROW_BASE} justify-between bg-default-100 px-2 py-2`}>
                                        <div>
                                            <span className="font-bold mr-2">Comparison</span> {comparison.title}
                                        </div>
                                        {entities.length > 0 && (
                                            <Button variant="secondary" size="sm" className="shrink-0" onPress={() => handleAddAllEntities(entities)}>
                                                Add all
                                            </Button>
                                        )}
                                    </li>
                                    {entities.map((suggestion) => (
                                        <li key={suggestion.id} className={`${ROW_BASE} gap-2 px-2 py-2`}>
                                            <Button
                                                isIconOnly
                                                variant="ghost"
                                                aria-label={`Add ${suggestion.label}`}
                                                className="!h-auto !min-w-0 !bg-transparent !p-0 text-primary hover:!bg-transparent"
                                                onPress={() => handleSelectEntity(suggestion.id, { label: suggestion.label })}
                                            >
                                                <FontAwesomeIcon icon={faPlusCircle} />
                                            </Button>
                                            {capitalize(suggestion.label)}
                                        </li>
                                    ))}
                                    {entities.length === 0 && (
                                        <li className={`${ROW_BASE} justify-center px-2 py-2 text-muted`}>No suggestions available</li>
                                    )}
                                </ul>
                            );
                        })}

                        {suggestionProperties.length > 0 && (
                            <ul className={LIST_BASE}>
                                {suggestionProperties
                                    .filter((property) => selectedEntities.filter((item) => item.id === property.id).length === 0)
                                    .map((suggestion) => (
                                        <li key={suggestion.id} className={`${ROW_BASE} gap-2 px-2 py-2`}>
                                            <Button
                                                isIconOnly
                                                variant="ghost"
                                                aria-label={`Add ${suggestion.label}`}
                                                className="!h-auto !min-w-0 !bg-transparent !p-0 text-primary hover:!bg-transparent"
                                                onPress={() => handleSelectEntity(suggestion.id, { label: suggestion.label })}
                                            >
                                                <FontAwesomeIcon icon={faPlusCircle} />
                                            </Button>
                                            {capitalize(suggestion.label)}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onPress={handleSave}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default SelectEntitiesModal;
