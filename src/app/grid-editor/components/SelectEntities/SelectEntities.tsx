import { difference, intersection, uniq } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';

import Item from '@/app/grid-editor/components/SelectEntities/Item';
import SelectedItem from '@/app/grid-editor/components/SelectEntities/SelectedItem';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import Filters from '@/app/search/components/Filters';
import useSearch, { IGNORED_CLASSES as DEFAULT_IGNORED_CLASSES } from '@/app/search/components/hooks/useSearch';
import Confirm from '@/components/Confirmation/Confirmation';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import Tabs from '@/components/Tabs/Tabs';
import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Col from '@/components/Ui/Structure/Col';
import Row from '@/components/Ui/Structure/Row';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { updateResource } from '@/services/backend/resources';
import { Thing } from '@/services/backend/things';

type AddEntityProps = {
    showDialog: boolean;
    toggle: () => void;
    allowCreate: boolean;
    onCreatePaper: () => void;
};

const DEFAULT_FILTERS = [
    { label: 'Paper', id: CLASSES.PAPER },
    {
        label: 'Research problem',
        id: CLASSES.PROBLEM,
    },
    {
        label: 'Resource',
        id: 'Resource',
    },
    {
        label: 'Property',
        id: 'Predicate',
    },
    {
        label: 'Class',
        id: 'Class',
    },
    {
        label: 'Venue',
        id: CLASSES.VENUE,
    },
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

const AddEntity: FC<AddEntityProps> = ({ showDialog, toggle, allowCreate = false, onCreatePaper = () => {} }) => {
    const { setEntityIds, entities } = useEntities();
    const { templates } = useTemplates();
    const [isOpenViewSelectedEntities, setIsOpenViewSelectedEntities] = useState(false);
    const [selectedEntities, setSelectedEntities] = useState<Thing[]>(entities ?? []);

    useEffect(() => {
        setSelectedEntities(entities ?? []);
    }, [entities]);

    const { typeData, page, countResults, isLoading, pageSize, setPageSize, setPage, results, hasNextPage, setSearchTerm } = useSearch({
        itemsPerFilter: 10,
        ignoredClasses: IGNORED_CLASSES,
        defaultFilters: DEFAULT_FILTERS,
        searchAuthor: false,
        redirectToEntity: false,
    });

    const handleSubmit = async () => {
        // get the list of newly selected entities by comparing the ids
        const newEntities = difference(
            selectedEntities.map((e) => e.id),
            entities?.map((e) => e.id) ?? [],
        )
            .map((id) => selectedEntities?.find((e) => e.id === id))
            .filter((e) => e !== undefined);

        // We calculate the new common classes because the user can select entities that are not instances of the current common classes
        // get the list of unselected entities by comparing the ids
        const unselectedEntities = difference(
            entities?.map((e) => e.id) ?? [],
            selectedEntities.map((e) => e.id),
        )
            .map((id) => entities?.find((e) => e.id === id))
            .filter((e) => e !== undefined);
        // get the list of old entities by comparing the ids
        const oldEntities = difference(
            entities?.map((e) => e.id) ?? [],
            unselectedEntities.map((e) => e.id),
        )
            .map((id) => entities?.find((e) => e.id === id))
            .filter((e) => e !== undefined);
        // get the common classes of the old entities
        const oldAllClassesIds = oldEntities?.filter((entity) => 'classes' in entity).map((entity) => entity.classes) ?? [];
        const oldCommonClasses = uniq(intersection(...oldAllClassesIds));
        // Ask the user if they want to apply the current common classes to the newly added entities ids
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

    return (
        <Modal isOpen={showDialog} toggle={toggle} size="xl" onClosed={() => setSearchTerm('')}>
            <ModalHeader toggle={toggle}>Select entities</ModalHeader>
            <ModalBody>
                <Tabs
                    items={[
                        {
                            label: 'Search',
                            key: 'search',
                            children: (
                                <Row className="tw:p-4">
                                    <Col md={4}>
                                        <Filters
                                            defaultFilters={DEFAULT_FILTERS}
                                            results={results ?? { content: [], page: { number: 0, size: 0, total_elements: 0, total_pages: 0 } }}
                                            countResults={countResults}
                                            typeData={typeData}
                                            isLoading={isLoading}
                                        />
                                    </Col>
                                    <Col md={8}>
                                        {isLoading && (
                                            <div className="p-4">
                                                <div className="flex-grow-1">
                                                    <Skeleton width={100} />
                                                    <Skeleton width={100} />
                                                    <Skeleton width={100} />
                                                    <Skeleton width={100} />
                                                    <Skeleton width={100} />
                                                </div>
                                            </div>
                                        )}
                                        {!isLoading && results && results?.content?.length > 0 && (
                                            <div className="rounded pb-4 h-100">
                                                <ListPaginatedContent<Thing>
                                                    renderListItem={renderListItem}
                                                    pageSize={pageSize}
                                                    label="entities"
                                                    isLoading={isLoading}
                                                    items={results.content ?? []}
                                                    page={page}
                                                    setPage={setPage}
                                                    hasNextPage={!!hasNextPage}
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
                                            <div className="rounded p-4 h-100 tw:border-1 tw:border-gray-200">
                                                <h2 className="h5">No results</h2>
                                                <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            ),
                        },
                        {
                            label: `Selected entities (${selectedEntities.length})`,
                            key: 'selected',
                            children: (
                                <div>
                                    <div className="p-3 h-100 ">
                                        <div className="tw:mt-4 tw:mb-4">
                                            {selectedEntities.length === 0 ? (
                                                <div className="tw:text-center tw:text-gray-500 tw:py-8">No entities selected</div>
                                            ) : (
                                                <div className="tw:space-y-2">
                                                    {selectedEntities.map((entity) => (
                                                        <SelectedItem key={entity.id} entity={entity} setSelectedEntities={setSelectedEntities} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ),
                        },
                    ]}
                    activeKey={isOpenViewSelectedEntities ? 'selected' : 'search'}
                    onChange={(...params) => {
                        setIsOpenViewSelectedEntities(params[0] === 'selected');
                    }}
                />
            </ModalBody>
            <ModalFooter className="d-flex">
                {allowCreate && (
                    <div className="flex-grow-1">
                        <Button color="light" onClick={() => onCreatePaper()}>
                            Add new paper
                        </Button>
                    </div>
                )}

                <Button color="primary" className="float-end" onClick={handleSubmit}>
                    Select
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AddEntity;
