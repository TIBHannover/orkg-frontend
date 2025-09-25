import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { FC } from 'react';

import useEditEntity from '@/app/grid-editor/hooks/useEditEntity';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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

const EditEntityDialog: FC<EditEntityDialogProps> = ({ entity, isOpen, toggle, fixedClasses }) => {
    const { draftClasses, label, isLoading, isSaving, handleChangeClasses, setLabel, handleSave } = useEditEntity(entity);

    const typeTitle = {
        [ENTITIES.CLASS]: 'class',
        [ENTITIES.PREDICATE]: 'property',
        [ENTITIES.RESOURCE]: 'resource',
        default: 'entity',
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Edit {typeTitle[entity._class]}
                <Link
                    className="tw:absolute tw:right-11 tw:top-3 tw:ml-2"
                    href={getLinkByEntityType(entity._class, entity?.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button color="link" className="tw:p-0">
                        Open {typeTitle[entity._class]} <FontAwesomeIcon icon={faExternalLinkAlt} className="tw:mr-1" />
                    </Button>
                </Link>
            </ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="label">Label</Label>
                    <Input
                        id="label"
                        name="label"
                        placeholder={`${typeTitle[entity._class]} label`}
                        type="text"
                        maxLength={MAX_LENGTH_INPUT}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </FormGroup>
                {entity._class === ENTITIES.RESOURCE && (
                    <FormGroup>
                        <Label for="label">Classes</Label>
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
                    </FormGroup>
                )}
                <div className="tw:flex tw:justify-end">
                    <ButtonWithLoading
                        isLoading={isSaving || isLoading}
                        color="primary"
                        className="tw:mt-2 tw:mb-2"
                        onClick={async () => {
                            await handleSave();
                            toggle();
                        }}
                    >
                        Save
                    </ButtonWithLoading>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default EditEntityDialog;
