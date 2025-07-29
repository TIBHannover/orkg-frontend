import { motion } from 'motion/react';
import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { MultiValue, SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import { Alert, FormGroup, FormText, Input, InputGroup, Label, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import LinkButton from '@/components/Autocomplete/ValueButtons/LinkButton';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useAuthentication from '@/components/hooks/useAuthentication';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import Button from '@/components/Ui/Button/Button';
import DATA_TYPES from '@/constants/DataTypes';
import { FILTER_SOURCE } from '@/constants/filters';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { getClassById } from '@/services/backend/classes';
import { getPredicatesByIds } from '@/services/backend/predicates';
import { Class, FilterConfig, Predicate } from '@/services/backend/types';

type FilterCurationFormProps = {
    isOpen: boolean;
    isSaving: boolean;
    toggle: () => void;
    handleSave: (_id: string | null, _filter: FilterConfig) => Promise<void>;
    filter?: FilterConfig | null;
};

const FilterCurationForm: FC<FilterCurationFormProps> = ({ isSaving, isOpen, toggle, handleSave, filter = null }) => {
    const [label, setLabel] = useState(filter ? filter.label : '');
    const [path, setPath] = useState<MultiValue<OptionType> | null>(null);
    const [range, setRange] = useState<SingleValue<OptionType>>(null);
    const [featured, setFeatured] = useState(filter ? filter.featured : false);
    const [persisted, setPersisted] = useState(filter ? filter.persisted : false);
    const [exact, setExact] = useState(filter ? filter.exact : true);

    const [isLoadingEntities, setIsLoadingEntities] = useState(false);
    const { isCurationAllowed } = useAuthentication();

    const handleSaveClick = async () => {
        if (!label || path?.length === 0 || !range) {
            toast.warning('All fields are required!');
            return;
        }

        await handleSave(filter?.id ?? null, {
            label,
            path: path?.map((p) => (p as Predicate).id) ?? [],
            range: (range as Class).id ?? null,
            featured: persisted && featured,
            exact,
            persisted,
            source: filter?.source,
        });
        toggle();
    };

    const resetValues = useCallback(() => {
        const loadEntities = async () => {
            if (!filter) return;
            setIsLoadingEntities(true);
            const _path = await getPredicatesByIds(filter.path);
            const _range = await getClassById(filter.range);
            setPath(_path);
            setRange(_range);
            setIsLoadingEntities(false);
        };
        if (filter) {
            loadEntities();
        } else {
            setPath([]);
            setRange(null);
            setIsLoadingEntities(false);
        }
        setLabel(filter ? filter.label : '');
        setFeatured(filter ? filter.featured : false);
        setPersisted(filter ? filter.persisted : false);
        setExact(filter ? filter.exact : true);
    }, [filter]);

    useEffect(() => {
        resetValues();
    }, [filter, resetValues]);

    const handleExactOptionChange = (e: ChangeEvent<HTMLInputElement>) => {
        setExact(e.target.value === 'exact');
    };

    return (
        <div>
            <ModalWithLoading onClosed={resetValues} isLoading={isSaving} isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>{filter ? 'Edit' : 'Add'} Filter</ModalHeader>
                <ModalBody>
                    {!isCurationAllowed && !filter && (
                        <Alert color="secondary">Please note that any added filters will only be stored locally in your browser.</Alert>
                    )}
                    <FormGroup>
                        <Label for="label">Filter label</Label>
                        <Input
                            id="label"
                            name="label"
                            type="text"
                            placeholder="Enter label for the filter"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="path">Path</Label>
                        {!isLoadingEntities ? (
                            <Autocomplete
                                entityType={ENTITIES.PREDICATE}
                                placeholder="Select or type to enter a property"
                                onChange={(selected) => {
                                    setPath(selected as MultiValue<OptionType>);
                                }}
                                value={path}
                                openMenuOnFocus
                                allowCreate={false}
                                isClearable
                                enableExternalSources={false}
                                isMulti
                            />
                        ) : (
                            'Loading...'
                        )}

                        <FormText>Select the path of properties to the value, they should be in the correct order</FormText>
                    </FormGroup>
                    <FormGroup>
                        <Label for="range">Range</Label>
                        {!isLoadingEntities ? (
                            <InputGroup>
                                <Autocomplete
                                    entityType={ENTITIES.CLASS}
                                    placeholder="Select or type to enter a class"
                                    onChange={(selected) => {
                                        setRange(selected as SingleValue<OptionType>);
                                    }}
                                    value={range}
                                    openMenuOnFocus
                                    allowCreate={false}
                                    isClearable
                                    additionalOptions={DATA_TYPES.filter((dt) => dt.classId !== CLASSES.RESOURCE).map((dt) => ({
                                        label: dt.name,
                                        id: dt.classId,
                                    }))}
                                    enableExternalSources={false}
                                />
                                <LinkButton value={range as OptionType} />
                            </InputGroup>
                        ) : (
                            'Loading...'
                        )}
                        <FormText>Select the class of the value</FormText>
                    </FormGroup>
                    <FormGroup check>
                        <Input name="exact" type="radio" id="exactTrue" value="exact" checked={exact} onChange={handleExactOptionChange} />{' '}
                        <Label for="exactTrue">
                            Exact match
                            <FormText className="ms-1">
                                Selecting this option will search for paths that exactly match the provided path, starting from the contribution node.
                                This means that only paths that match the entire provided path, without any additional elements, will be considered.
                            </FormText>
                        </Label>
                    </FormGroup>
                    <FormGroup check className="mb-1">
                        <Input name="exact" type="radio" id="exactFalse" value="anywhere" checked={!exact} onChange={handleExactOptionChange} />{' '}
                        <Label for="exactFalse">
                            Match anywhere{' '}
                            <FormText className="ms-1">
                                Selecting this option will search for paths that contain the provided path anywhere within the subgraph of the
                                contribution node. This means that even if the provided path is a part of a longer path, it will still be considered a
                                match.
                                {!exact && (
                                    <div className="mt-2">
                                        <motion.div
                                            style={{ originX: 1, originY: 0 }}
                                            initial="initial"
                                            exit="initial"
                                            animate="animate"
                                            variants={{
                                                initial: { scale: 0, opacity: 0, y: -10 },
                                                animate: {
                                                    scale: 1,
                                                    opacity: 1,
                                                    y: 0,
                                                    transition: {
                                                        type: 'spring',
                                                        duration: 0.4,
                                                        delayChildren: 0.2,
                                                        staggerChildren: 0.05,
                                                    },
                                                },
                                            }}
                                        >
                                            <Alert color="warning" className="mb-0">
                                                Note that this option might lead to slower execution. Additionally, it can only search within a path
                                                of length 10
                                            </Alert>
                                        </motion.div>
                                    </div>
                                )}
                            </FormText>
                        </Label>
                    </FormGroup>

                    {filter?.source !== FILTER_SOURCE.LOCAL_STORAGE && isCurationAllowed && (
                        <>
                            <FormGroup check>
                                <Input
                                    id="persisted"
                                    type="checkbox"
                                    checked={persisted}
                                    onChange={() => {
                                        setPersisted(!persisted);
                                    }}
                                />
                                <Label check for="persisted">
                                    Persist this filter on the observatory page
                                </Label>
                            </FormGroup>
                            <FormGroup check>
                                <Input
                                    id="featured"
                                    type="checkbox"
                                    checked={persisted && featured}
                                    onChange={() => {
                                        setFeatured(!featured);
                                    }}
                                    disabled={!persisted}
                                />
                                <Label check for="featured">
                                    Show this filter by default on the observatory page
                                </Label>
                            </FormGroup>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={toggle}>
                        Cancel
                    </Button>
                    <ButtonWithLoading isLoading={isSaving} color="primary" onClick={handleSaveClick}>
                        {!filter ? 'Add filter' : 'Save'}
                    </ButtonWithLoading>
                </ModalFooter>
            </ModalWithLoading>
        </div>
    );
};

export default FilterCurationForm;
