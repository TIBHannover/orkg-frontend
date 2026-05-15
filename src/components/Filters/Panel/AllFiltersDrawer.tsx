'use client';

import { faPen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Chip, Drawer, Label } from '@heroui/react';
import { Dispatch, FC, Fragment, SetStateAction, useCallback, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import FilterInputField from '@/components/Filters/FilterInputField/FilterInputField';
import FilterLabel from '@/components/Filters/FilterInputField/FilterLabel';
import useCurateFilters from '@/components/Filters/hooks/useCurateFilters';
import FilterCurationForm from '@/components/Filters/Panel/FilterCurationForm';
import useAuthentication from '@/components/hooks/useAuthentication';
import { FILTER_SOURCE } from '@/constants/filters';
import { FilterConfig, FilterConfigValue } from '@/services/backend/types';

type AllFiltersDrawerProps = {
    id: string;
    filters: FilterConfig[];
    isOpen: boolean;
    toggle: () => void;
    refreshFilters: () => void;
    setFilters: Dispatch<SetStateAction<FilterConfig[]>>;
    updateFilterValue: (_filter: FilterConfig, value: FilterConfigValue[] | string) => void;
    showResult: () => void;
    resetFilters: () => void;
};

const AllFiltersDrawer: FC<AllFiltersDrawerProps> = ({
    id,
    filters,
    isOpen,
    toggle,
    refreshFilters,
    setFilters,
    updateFilterValue,
    showResult,
    resetFilters,
}) => {
    const { isCurationAllowed } = useAuthentication();
    const [showEditDialog, setShowEditDialog] = useState(false);

    const { isSaving, currentFilter, handleSaveFilter, deleteFilter, setCurrentFilter } = useCurateFilters({
        oId: id,
        filters,
        setFilters,
        refreshFilters,
    });

    const openEditFilterModal = (filter: FilterConfig | null) => {
        setCurrentFilter(filter);
        setShowEditDialog((v) => !v);
    };

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                toggle();
            }
        },
        [toggle],
    );

    return (
        <>
            <Drawer.Backdrop className="z-[1055]" isOpen={isOpen} onOpenChange={handleOpenChange} isDismissable>
                <Drawer.Content placement="right">
                    <Drawer.Dialog>
                        <Drawer.Header className="flex flex-row items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                All filters <ActionButton title="Add filter" icon={faPlus} action={() => openEditFilterModal(null)} />
                            </div>
                            <Drawer.CloseTrigger aria-label="Close" />
                        </Drawer.Header>
                        <Drawer.Body>
                            <div className="mb-4 flex flex-col gap-3">
                                {filters.map((filter, index) => (
                                    <Fragment key={filter.id || index}>
                                        <div>
                                            <div className="flex items-center justify-between gap-2">
                                                <Label htmlFor={filter?.id || index.toString()} className="flex items-center gap-2 grow">
                                                    <FilterLabel filter={filter} />
                                                    {isCurationAllowed && !!filter.featured && (
                                                        <Chip size="sm" color="default">
                                                            Featured
                                                        </Chip>
                                                    )}
                                                </Label>
                                                {(filter.source === FILTER_SOURCE.LOCAL_STORAGE ||
                                                    (filter.source === FILTER_SOURCE.DATABASE && isCurationAllowed)) && (
                                                    <div className="shrink-0 flex items-center gap-1">
                                                        <ActionButton
                                                            title="Edit filter"
                                                            icon={faPen}
                                                            action={() =>
                                                                openEditFilterModal({ ...filter, id: filter.id || index.toString() } as FilterConfig)
                                                            }
                                                        />
                                                        <ActionButton title="Delete filter" icon={faTimes} action={() => deleteFilter(filter)} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-1">
                                                <FilterInputField filter={filter} updateFilterValue={updateFilterValue} />
                                            </div>
                                        </div>
                                        <hr className="m-0" />
                                    </Fragment>
                                ))}
                                {filters.length === 0 && (
                                    <Alert status="accent">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                            <Alert.Title>No filters on this page yet!</Alert.Title>
                                            <Alert.Description>
                                                Click on <FontAwesomeIcon size="xs" icon={faPlus} /> to add a filter
                                            </Alert.Description>
                                        </Alert.Content>
                                    </Alert>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onPress={showResult}>Show results</Button>
                                <Button variant="secondary" onPress={resetFilters}>
                                    Reset
                                </Button>
                            </div>
                        </Drawer.Body>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
            <FilterCurationForm
                isSaving={isSaving}
                filter={currentFilter}
                isOpen={showEditDialog}
                toggle={() => setShowEditDialog((v) => !v)}
                handleSave={handleSaveFilter}
            />
        </>
    );
};

export default AllFiltersDrawer;
