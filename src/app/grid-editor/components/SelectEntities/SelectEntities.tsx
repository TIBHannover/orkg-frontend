import { Button, Modal, Skeleton, Tabs } from '@heroui/react';
import { difference, intersection, uniq } from 'lodash';
import Link from 'next/link';
import { FC, useState } from 'react';

import Item from '@/app/grid-editor/components/SelectEntities/Item';
import SelectedItem from '@/app/grid-editor/components/SelectEntities/SelectedItem';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import Filters from '@/app/search/components/Filters';
import useSearch, { IGNORED_CLASSES as DEFAULT_IGNORED_CLASSES } from '@/app/search/components/hooks/useSearch';
import useSmartFilters from '@/app/search/components/hooks/useSmartFilters';
import Confirm from '@/components/Confirmation/Confirmation';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { updateResource } from '@/services/backend/resources';
import { Thing } from '@/services/backend/things';
import { PaginatedResponse, ResourceThingReference } from '@/services/backend/types';

type AddEntityProps = {
    showDialog: boolean;
    toggle: () => void;
    allowCreate: boolean;
    onCreatePaper: () => void;
    setEntityIds: (ids: string[]) => void;
    entities: Thing[] | ResourceThingReference[] | undefined;
};

const DEFAULT_FILTERS = [
    { label: 'Paper', id: CLASSES.PAPER },
    { label: 'Research problem', id: CLASSES.PROBLEM },
    { label: 'Resource', id: 'Resource' },
    { label: 'Property', id: 'Predicate' },
    { label: 'Class', id: 'Class' },
    { label: 'Venue', id: CLASSES.VENUE },
];

const IGNORED_CLASSES = [
    ...DEFAULT_IGNORED_CLASSES,
    'Literal',
    CLASSES.NODE_SHAPE,
    CLASSES.ROSETTA_NODE_SHAPE,
    CLASSES.PROPERTY_SHAPE,
    CLASSES.LIST,
    CLASSES.RESEARCH_FIELD,
    CLASSES.ROSETTA_STONE_STATEMENT,
    CLASSES.CONTRIBUTION,
];

const SelectEntities: FC<AddEntityProps> = ({ showDialog, toggle, allowCreate = false, onCreatePaper = () => {}, setEntityIds, entities }) => {
    const { templates } = useTemplates();
    const [activeTab, setActiveTab] = useState<'search' | 'selected'>('search');
    const [selectedEntities, setSelectedEntities] = useState<(Thing | ResourceThingReference)[]>(entities ?? []);

    const entitiesKey = entities?.map((e) => e.id).join(',');
    const [prevEntitiesKey, setPrevEntitiesKey] = useState(entitiesKey);
    if (entitiesKey !== prevEntitiesKey) {
        setPrevEntitiesKey(entitiesKey);
        setSelectedEntities(entities ?? []);
    }

    const {
        searchTerm,
        typeData,
        page,
        countResults,
        isLoading,
        pageSize,
        setPageSize,
        setPage,
        results: _results,
        hasNextPage,
        setSearchTerm,
    } = useSearch({
        itemsPerFilter: 10,
        ignoredClasses: IGNORED_CLASSES,
        defaultFilters: DEFAULT_FILTERS,
        searchAuthor: false,
        redirectToEntity: false,
    });

    const {
        filteredItemsIds,
        selectedSmartFilter,
        setSelectedSmartFilter,
        generateSmartFilters,
        isLoading: isLoadingSmartFilters,
        error: errorSmartFilters,
        facets,
    } = useSmartFilters(searchTerm, _results);

    const handleSubmit = async () => {
        const newEntities = difference(
            selectedEntities.map((e) => e.id),
            entities?.map((e) => e.id) ?? [],
        )
            .map((id) => selectedEntities?.find((e) => e.id === id))
            .filter((e) => e !== undefined);

        const unselectedEntities = difference(
            entities?.map((e) => e.id) ?? [],
            selectedEntities.map((e) => e.id),
        )
            .map((id) => entities?.find((e) => e.id === id))
            .filter((e) => e !== undefined);
        const oldEntities = difference(
            entities?.map((e) => e.id) ?? [],
            unselectedEntities.map((e) => e.id),
        )
            .map((id) => entities?.find((e) => e.id === id))
            .filter((e) => e !== undefined);
        const oldAllClassesIds = oldEntities?.filter((entity) => 'classes' in entity).map((entity) => entity.classes) ?? [];
        const oldCommonClasses = uniq(intersection(...oldAllClassesIds));
        const newAllClassesIds = newEntities?.filter((entity) => 'classes' in entity).map((entity) => entity.classes) ?? [];
        const newCommonClasses = uniq(intersection(...newAllClassesIds));
        const classesNeedToApply = difference(oldCommonClasses, newCommonClasses);
        const resourcesCount = newEntities.filter((e) => e._class === ENTITIES.RESOURCE).length;
        if (resourcesCount > 0 && classesNeedToApply.length > 0) {
            const templatesNeedToApply = templates?.filter((t) => classesNeedToApply.includes(t.target_class.id)) ?? [];
            if (templatesNeedToApply.length > 0) {
                const isConfirmed = await Confirm({
                    title: 'Apply templates',
                    message: (
                        <>
                            <p>We found that the newly added entities are not instances of the following templates:</p>
                            <ul>
                                {templatesNeedToApply.map((t) => (
                                    <li key={`c${t.id}`}>
                                        <TemplateTooltip id={t.id}>
                                            <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: t.id })}>
                                                {t.label}
                                            </Link>
                                        </TemplateTooltip>
                                    </li>
                                ))}
                            </ul>
                            <p>Would you like to make them instances?</p>
                        </>
                    ),
                    proceedLabel: 'Apply',
                });
                if (isConfirmed) {
                    await Promise.all(
                        newEntities
                            .filter((newEntity) => newEntity && 'classes' in newEntity)
                            .map((newEntity) => updateResource(newEntity.id, { classes: uniq([...newEntity.classes, ...classesNeedToApply]) })),
                    );
                }
            }
        }
        setEntityIds(selectedEntities.map((e) => e.id));
        toggle();
    };

    const renderListItem = (item: Thing) => (
        <Item showContributions item={item} key={item.id} selectedEntities={selectedEntities} setSelectedEntities={setSelectedEntities} />
    );

    let results: PaginatedResponse<Thing> | undefined = _results;
    if (filteredItemsIds.length > 0) {
        results = {
            ..._results,
            content: _results?.content?.filter((item) => filteredItemsIds.includes(item.id)),
        } as PaginatedResponse<Thing>;
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSearchTerm('');
            setPage(0);
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen={showDialog} onOpenChange={handleOpenChange}>
            <Modal.Container placement="top">
                <Modal.Dialog className="!max-w-5xl w-full max-h-[85vh]">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Select entities</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1 overflow-y-auto">
                        <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as 'search' | 'selected')}>
                            <Tabs.List>
                                <Tabs.Tab id="search">
                                    Search <Tabs.Indicator />
                                </Tabs.Tab>
                                <Tabs.Tab id="selected">
                                    Selected entities ({selectedEntities.length}) <Tabs.Indicator />
                                </Tabs.Tab>
                            </Tabs.List>
                            <Tabs.Panel id="search" shouldForceMount className="data-[inert]:hidden">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4">
                                    <div className="md:col-span-4">
                                        <Filters
                                            defaultFilters={DEFAULT_FILTERS}
                                            results={results ?? { content: [], page: { number: 0, size: 0, total_elements: 0, total_pages: 0 } }}
                                            countResults={countResults}
                                            typeData={typeData}
                                            isLoading={isLoading}
                                            generateSmartFilters={generateSmartFilters}
                                            isLoadingSmartFilters={isLoadingSmartFilters}
                                            errorSmartFilters={errorSmartFilters}
                                            facets={facets || []}
                                            selectedSmartFilter={selectedSmartFilter}
                                            setSelectedSmartFilter={setSelectedSmartFilter}
                                        />
                                    </div>
                                    <div className="md:col-span-8">
                                        {isLoading && (
                                            <div className="p-6 flex flex-col gap-2">
                                                <Skeleton className="w-[100px] h-4 rounded" />
                                                <Skeleton className="w-[100px] h-4 rounded" />
                                                <Skeleton className="w-[100px] h-4 rounded" />
                                                <Skeleton className="w-[100px] h-4 rounded" />
                                                <Skeleton className="w-[100px] h-4 rounded" />
                                            </div>
                                        )}
                                        {!isLoading && results && results?.content?.length > 0 && (
                                            <div className="rounded pb-6 h-full">
                                                <ListPaginatedContent<Thing>
                                                    renderListItem={renderListItem}
                                                    pageSize={pageSize}
                                                    label="entities"
                                                    isLoading={isLoading}
                                                    items={results.content ?? []}
                                                    page={page}
                                                    setPage={setPage}
                                                    hasNextPage={hasNextPage}
                                                    setPageSize={setPageSize}
                                                    totalElements={results.page.total_elements}
                                                    error={null}
                                                    totalPages={results.page.total_pages}
                                                    flush={false}
                                                    boxShadow={false}
                                                />
                                            </div>
                                        )}
                                        {!isLoading && results?.content?.length === 0 && (
                                            <div className="rounded p-6 h-full border border-default">
                                                <h2 className="text-xl">No results</h2>
                                                <div className="text-center mt-6 mb-6">There are no results, please try a different search term</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Tabs.Panel>
                            <Tabs.Panel id="selected" shouldForceMount className="data-[inert]:hidden">
                                <div className="p-4">
                                    {selectedEntities.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">No entities selected</div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {selectedEntities.map((entity) => (
                                                <SelectedItem key={entity.id} entity={entity} setSelectedEntities={setSelectedEntities} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Tabs.Panel>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer className="flex">
                        {allowCreate && (
                            <div className="grow">
                                <Button variant="secondary" onPress={() => onCreatePaper()}>
                                    Add new paper
                                </Button>
                            </div>
                        )}
                        <Button onPress={handleSubmit}>Select</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default SelectEntities;
