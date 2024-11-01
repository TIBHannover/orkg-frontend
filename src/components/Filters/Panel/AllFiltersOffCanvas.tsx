import { faPen, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FilterInputField from 'components/Filters/FilterInputField/FilterInputField';
import FilterLabel from 'components/Filters/FilterInputField/FilterLabel';
import FilterCurationForm from 'components/Filters/Panel/FilterCurationForm';
import useCurateFilters from 'components/Filters/hooks/useCurateFilters';
import ActionButton from 'components/ActionButton/ActionButton';
import { FILTER_SOURCE } from 'constants/filters';
import { Dispatch, FC, Fragment, SetStateAction, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Badge, Button, Label, Offcanvas, OffcanvasBody, OffcanvasHeader } from 'reactstrap';
import { FilterConfig, FilterConfigValue } from 'services/backend/types';
import { isCurationAllowed } from 'slices/authSlice';
import { RootStore } from 'slices/types';

type AllFiltersOffCanvasProps = {
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

const AllFiltersOffCanvas: FC<AllFiltersOffCanvasProps> = ({
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
    const isCurator = useSelector((state: RootStore) => isCurationAllowed(state));
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

    return (
        <Offcanvas direction="end" isOpen={isOpen} toggle={toggle}>
            <OffcanvasHeader toggle={toggle}>
                All filters <ActionButton title="Add filter" icon={faPlus} action={() => openEditFilterModal(null)} />
            </OffcanvasHeader>
            <OffcanvasBody>
                <div className="mb-3">
                    {filters.map((filter, index) => (
                        <Fragment key={filter.id || index}>
                            <div className="col-auto">
                                <Label for={filter?.id || index.toString()} className="col-form-label d-block">
                                    <FilterLabel filter={filter} />
                                    {isCurator && filter.featured && (
                                        <small>
                                            <Badge>Featured</Badge>
                                        </small>
                                    )}
                                    {(filter.source === FILTER_SOURCE.LOCAL_STORAGE || (filter.source === FILTER_SOURCE.DATABASE && isCurator)) && (
                                        <div className="float-end">
                                            <ActionButton
                                                title="Edit filter"
                                                icon={faPen}
                                                action={() => openEditFilterModal({ ...filter, id: filter.id || index.toString() } as FilterConfig)}
                                            />

                                            <ActionButton title="Delete filter" icon={faTimes} action={() => deleteFilter(filter)} />
                                        </div>
                                    )}
                                </Label>
                            </div>
                            <div className="col-auto">
                                <FilterInputField filter={filter} updateFilterValue={updateFilterValue} />
                            </div>
                            <hr />
                        </Fragment>
                    ))}
                    {filters.length === 0 && (
                        <Alert color="light">
                            No filters on this page yet! <br />
                            <small>
                                Click on <FontAwesomeIcon size="xs" icon={faPlus} /> to add a filter
                            </small>
                        </Alert>
                    )}
                </div>
                <div>
                    <Button color="primary" className="me-2" onClick={showResult}>
                        Show results
                    </Button>
                    <Button color="light" className="me-2" onClick={resetFilters}>
                        Reset
                    </Button>
                </div>
            </OffcanvasBody>
            <FilterCurationForm
                isSaving={isSaving}
                filter={currentFilter}
                isOpen={showEditDialog}
                toggle={() => setShowEditDialog((v) => !v)}
                handleSave={handleSaveFilter}
            />
        </Offcanvas>
    );
};

export default AllFiltersOffCanvas;
