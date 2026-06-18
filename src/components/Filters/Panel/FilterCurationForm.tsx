import { Alert, Button, Checkbox, Input, Label, Modal, Radio, RadioGroup, TextField, toast } from '@heroui/react';
import { motion } from 'motion/react';
import { FC, useCallback, useEffect, useState } from 'react';
import { MultiValue, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import LinkButton from '@/components/Autocomplete/ValueButtons/LinkButton';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useAuthentication from '@/components/hooks/useAuthentication';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        resetValues();
    }, [filter, resetValues]);

    return (
        <ModalWithLoading onClosed={resetValues} isLoading={isSaving} isOpen={isOpen} toggle={toggle} backdropClassName="z-[1060]">
            <Modal.Header>
                <Modal.CloseTrigger />
                <Modal.Heading>{filter ? 'Edit' : 'Add'} Filter</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
                <div className="flex flex-col gap-4">
                    {!isCurationAllowed && !filter && (
                        <Alert status="accent">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Description>Please note that any added filters will only be stored locally in your browser.</Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}

                    <TextField fullWidth name="label" value={label} onChange={setLabel}>
                        <Label>Filter label</Label>
                        <Input placeholder="Enter label for the filter" />
                    </TextField>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="path">Path</Label>
                        {!isLoadingEntities ? (
                            <Autocomplete
                                inputId="path"
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
                            <div className="text-sm text-muted">Loading...</div>
                        )}
                        <small className="text-muted text-xs">Select the path of properties to the value, they should be in the correct order</small>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="range">Range</Label>
                        {!isLoadingEntities ? (
                            <div className="flex items-stretch">
                                <div className="grow">
                                    <Autocomplete
                                        inputId="range"
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
                                </div>
                                <LinkButton value={range as OptionType} />
                            </div>
                        ) : (
                            <div className="text-sm text-muted">Loading...</div>
                        )}
                        <small className="text-muted text-xs">Select the class of the value</small>
                    </div>

                    <RadioGroup value={exact ? 'exact' : 'anywhere'} onChange={(value) => setExact(value === 'exact')}>
                        <Radio value="exact">
                            <Radio.Control>
                                <Radio.Indicator />
                            </Radio.Control>
                            <Radio.Content>
                                Exact match
                                <div className="text-muted text-xs mt-1">
                                    Selecting this option will search for paths that exactly match the provided path, starting from the contribution
                                    node. This means that only paths that match the entire provided path, without any additional elements, will be
                                    considered.
                                </div>
                            </Radio.Content>
                        </Radio>
                        <Radio value="anywhere">
                            <Radio.Control>
                                <Radio.Indicator />
                            </Radio.Control>
                            <Radio.Content>
                                Match anywhere
                                <div className="text-muted text-xs mt-1">
                                    Selecting this option will search for paths that contain the provided path anywhere within the subgraph of the
                                    contribution node. This means that even if the provided path is a part of a longer path, it will still be
                                    considered a match.
                                </div>
                                {!exact && (
                                    <motion.div
                                        className="mt-2"
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
                                                transition: { type: 'spring', duration: 0.4 },
                                            },
                                        }}
                                    >
                                        <Alert status="warning">
                                            <Alert.Indicator />
                                            <Alert.Content>
                                                <Alert.Description>
                                                    Note that this option might lead to slower execution. Additionally, it can only search within a
                                                    path of length 10
                                                </Alert.Description>
                                            </Alert.Content>
                                        </Alert>
                                    </motion.div>
                                )}
                            </Radio.Content>
                        </Radio>
                    </RadioGroup>

                    {filter?.source !== FILTER_SOURCE.LOCAL_STORAGE && isCurationAllowed && (
                        <div className="flex flex-col gap-2">
                            <Checkbox isSelected={persisted} onChange={(checked) => setPersisted(checked)}>
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Checkbox.Content>Persist this filter on the observatory page</Checkbox.Content>
                            </Checkbox>
                            <Checkbox isSelected={persisted && featured} onChange={(checked) => setFeatured(checked)} isDisabled={!persisted}>
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Checkbox.Content>Show this filter by default on the observatory page</Checkbox.Content>
                            </Checkbox>
                        </div>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onPress={toggle}>
                    Cancel
                </Button>
                <ButtonWithLoading isLoading={isSaving} variant="primary" onPress={handleSaveClick}>
                    {!filter ? 'Add filter' : 'Save'}
                </ButtonWithLoading>
            </Modal.Footer>
        </ModalWithLoading>
    );
};

export default FilterCurationForm;
