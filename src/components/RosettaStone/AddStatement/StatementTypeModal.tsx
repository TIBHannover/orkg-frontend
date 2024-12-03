import { OptionType } from 'components/Autocomplete/types';
import { RosettaStoneTemplateOption } from 'components/RosettaStone/AddStatement/SelectOption';
import StatementTypeAutocomplete from 'components/RosettaStone/AddStatement/StatementTypeAutocomplete';
import useUsedStatementTypes from 'components/RosettaStone/hooks/useUsedStatementTypes';
import { useState } from 'react';
import { SingleValue } from 'react-select';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

type StatementTypeModalProps = {
    isOpen: boolean;
    toggle: () => void;
    context: string;
    subject: OptionType | null;
    handleAddStatement?: (templateId: string, subjects: OptionType[]) => void;
};

const StatementTypeModal = ({ isOpen, toggle, context, subject, handleAddStatement }: StatementTypeModalProps) => {
    const { usedStatementTypes } = useUsedStatementTypes({ context });

    const [selectedStatementType, setSelectedStatementType] = useState<OptionType | null>(null);

    const onChange = (value: SingleValue<RosettaStoneTemplateOption>) => {
        setSelectedStatementType(value);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Select statement type</ModalHeader>
            <ModalBody>
                <p>Select the type of statement you want to add.</p>
                <StatementTypeAutocomplete additionalOptions={usedStatementTypes} onChange={onChange} autoFocus={false} openMenuOnFocus={false} />
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
                >
                    Add
                </Button>
            </ModalFooter>
        </Modal>
    );
};
export default StatementTypeModal;
