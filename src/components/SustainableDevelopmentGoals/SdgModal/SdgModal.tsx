import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { FC, useState } from 'react';
import Select, { OnChangeValue } from 'react-select';
import useSWR from 'swr';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import { sortSdgs } from '@/components/SustainableDevelopmentGoals/helpers';
import Goal from '@/components/SustainableDevelopmentGoals/SdgModal/Sdg';
import SelectOption from '@/components/SustainableDevelopmentGoals/SdgModal/SelectOption';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from '@/constants/graphSettings';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { Node } from '@/services/backend/types';

type SdgModalProps = {
    toggle: () => void;
    handleSave: (sdgs: Node[]) => void;
    sdgs?: Node[];
    isEditing?: boolean;
};

export type OptionType = {
    id: string;
    label: string;
};

const SdgModal: FC<SdgModalProps> = ({ toggle, sdgs = [], handleSave, isEditing = false }) => {
    const [sdgsLocal, setSdgsLocal] = useState(sortSdgs(sdgs));
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { data: options = [], isLoading: isLoadingOptions } = useSWR(
        [Object.values(SUSTAINABLE_DEVELOPMENT_GOALS), resourcesUrl, 'getResource'],
        async ([resourceIds]) => {
            const sdgResources = await Promise.all(resourceIds.map((resourceId) => getResource(resourceId)));
            return sdgResources.map((resource): OptionType => ({ id: resource.id, label: resource.label }));
        },
        { shouldRetryOnError: false },
    );

    // The overlay and the dismiss guards cover both fetching the goals and saving them
    const isLoading = isLoadingOptions || isSaving;

    const handleOpenChange = (open: boolean) => {
        if (!open && !isLoading) {
            toggle();
        }
    };

    const handleDelete = (id: string) => setSdgsLocal((_sdgs) => _sdgs.filter((_sdg) => id !== _sdg.id));

    const handleSelect = (sdg: OnChangeValue<OptionType, false>) => {
        if (!sdg?.id) {
            return;
        }
        setSdgsLocal((_sdgs) => sortSdgs([..._sdgs, sdg]));
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        await handleSave(sdgsLocal);
        toggle();
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={handleOpenChange} isDismissable={!isLoading} isKeyboardDismissDisabled={isLoading}>
            <Modal.Container className="max-h-[calc(100vh-73px)] mt-[73px]">
                <Modal.Dialog>
                    <LoadingOverlay isLoading={isLoading} className="rounded" />
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Sustainable Development Goals (SDGs)</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1 flex flex-col gap-3">
                        <div className="flex flex-col">
                            {sdgsLocal.map((sdg) => (
                                <Goal
                                    sdg={sdg}
                                    label={options.find((option) => option.id === sdg.id)?.label || ''}
                                    key={sdg.id}
                                    onDelete={handleDelete}
                                    isEditing={isEditing}
                                />
                            ))}
                        </div>

                        {isEditing && !isAdding && (
                            <Button variant="secondary" onPress={() => setIsAdding(true)} fullWidth>
                                <FontAwesomeIcon icon={faPlus} /> Add goal
                            </Button>
                        )}
                        {isAdding && (
                            <Select
                                onChange={handleSelect}
                                options={options.filter(({ id }) => !sdgsLocal.find((sdg) => sdg.id === id))}
                                components={{ Option: SelectOption }}
                                onBlur={() => setIsAdding(false)}
                                classNamePrefix="react-select"
                                classNames={customClassNames as any}
                                styles={customStyles as any}
                                menuPosition="fixed"
                                blurInputOnSelect
                                autoFocus
                                aria-label="Select an SDG"
                                defaultMenuIsOpen
                            />
                        )}
                    </Modal.Body>
                    {isEditing && (
                        <Modal.Footer>
                            <Button variant="secondary" onPress={toggle}>
                                Cancel
                            </Button>
                            <Button onPress={handleSaveClick}>Save</Button>
                        </Modal.Footer>
                    )}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default SdgModal;
