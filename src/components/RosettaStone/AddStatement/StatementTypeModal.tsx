import { useRef, useState } from 'react';
import { SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import { RosettaStoneTemplateOption } from '@/components/RosettaStone/AddStatement/SelectOption';
import StatementTypeAutocomplete from '@/components/RosettaStone/AddStatement/StatementTypeAutocomplete';
import useUsedStatementTypes from '@/components/RosettaStone/hooks/useUsedStatementTypes';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { RosettaStoneTemplate } from '@/services/backend/types';

type StatementTypeModalProps = {
    template: RosettaStoneTemplate | null;
    isOpen: boolean;
    toggle: () => void;
    context: string;
    subject: OptionType | null;
    handleAddStatement?: (templateId: string, subjects: OptionType[]) => void;
};

const StatementTypeModal = ({ template, isOpen, toggle, context, subject, handleAddStatement }: StatementTypeModalProps) => {
    const addBtn = useRef<HTMLButtonElement | null>(null);

    const { usedStatementTypes } = useUsedStatementTypes({ context });

    const [selectedStatementType, setSelectedStatementType] = useState<OptionType | null>(template);

    const onChange = (value: SingleValue<RosettaStoneTemplateOption>) => {
        setSelectedStatementType(value);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg" onOpened={() => addBtn?.current?.focus()}>
            <ModalHeader toggle={toggle}>Select statement type</ModalHeader>
            <ModalBody>
                <p>Select the type of statement you want to add.</p>
                <StatementTypeAutocomplete
                    additionalOptions={usedStatementTypes}
                    onChange={onChange}
                    autoFocus={false}
                    openMenuOnFocus={false}
                    defaultValue={template ?? undefined}
                />
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button className="float-start" color="light" onClick={toggle}>
                    Cancel
                </Button>

                <Button
                    color="primary"
                    className="float-end"
                    onClick={() => {
                        if (selectedStatementType && handleAddStatement && subject) {
                            handleAddStatement(selectedStatementType.id, [subject]);
                            toggle();
                        }
                    }}
                    innerRef={(instance) => {
                        addBtn.current = instance;
                    }}
                >
                    Add
                </Button>
            </ModalFooter>
        </Modal>
    );
};
export default StatementTypeModal;
