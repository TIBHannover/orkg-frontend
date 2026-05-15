import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Label, Modal, TextField } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import useEditEntity from '@/app/grid-editor/hooks/useEditEntity';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { Thing } from '@/services/backend/things';
import { getLinkByEntityType } from '@/utils';

type EditEntityDialogProps = {
    entity: Thing;
    isOpen: boolean;
    toggle: () => void;
    fixedClasses?: string[];
};

const TYPE_TITLE: Record<string, string> = {
    [ENTITIES.CLASS]: 'class',
    [ENTITIES.PREDICATE]: 'property',
    [ENTITIES.RESOURCE]: 'resource',
};

const EditEntityDialog: FC<EditEntityDialogProps> = ({ entity, isOpen, toggle, fixedClasses }) => {
    const { draftClasses, label, isLoading, isSaving, handleChangeClasses, setLabel, handleSave } = useEditEntity(entity);

    const typeLabel = TYPE_TITLE[entity._class] ?? 'entity';

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={toggle}>
            <Modal.Container size="lg">
                <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <div className="flex items-center justify-between gap-3 pe-8">
                            <Modal.Heading>Edit {typeLabel}</Modal.Heading>
                            <Link
                                href={getLinkByEntityType(entity._class, entity?.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm inline-flex items-center gap-1 shrink-0"
                            >
                                Open {typeLabel} <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                            </Link>
                        </div>
                    </Modal.Header>
                    <Modal.Body className="flex flex-col gap-4 p-1">
                        <TextField fullWidth name="label" value={label} onChange={setLabel}>
                            <Label>Label</Label>
                            <Input placeholder={`${typeLabel} label`} maxLength={MAX_LENGTH_INPUT} />
                        </TextField>

                        {entity._class === ENTITIES.RESOURCE && (
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="classes-autocomplete">Classes</Label>
                                <Autocomplete
                                    entityType={ENTITIES.CLASS}
                                    onChange={(selected, action) => {
                                        if (action.removedValue && action.removedValue.isFixed) {
                                            return;
                                        }
                                        handleChangeClasses(selected, action);
                                    }}
                                    placeholder="Specify the classes of the resource"
                                    value={draftClasses}
                                    openMenuOnFocus
                                    allowCreate
                                    isMulti
                                    enableExternalSources
                                    fixedOptions={fixedClasses}
                                    inputId="classes-autocomplete"
                                />
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onPress={toggle}>
                            Cancel
                        </Button>
                        <ButtonWithLoading
                            isLoading={isSaving || isLoading}
                            variant="primary"
                            onPress={async () => {
                                await handleSave();
                                toggle();
                            }}
                        >
                            Save
                        </ButtonWithLoading>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default EditEntityDialog;
