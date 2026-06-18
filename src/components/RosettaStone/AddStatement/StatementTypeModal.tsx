import { Button, Modal } from '@heroui/react';
import { useState } from 'react';
import { SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import { RosettaStoneTemplateOption } from '@/components/RosettaStone/AddStatement/SelectOption';
import StatementTypeAutocomplete from '@/components/RosettaStone/AddStatement/StatementTypeAutocomplete';
import useUsedStatementTypes from '@/components/RosettaStone/hooks/useUsedStatementTypes';
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
    const { usedStatementTypes } = useUsedStatementTypes({ context });

    const [selectedStatementType, setSelectedStatementType] = useState<OptionType | null>(template);

    const onChange = (value: SingleValue<RosettaStoneTemplateOption>) => {
        setSelectedStatementType(value);
    };

    const handleAdd = () => {
        if (selectedStatementType && handleAddStatement && subject) {
            handleAddStatement(selectedStatementType.id, [subject]);
            toggle();
        }
    };

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg" className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Select statement template</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Select the type of statement you want to add.</p>
                        <StatementTypeAutocomplete
                            additionalOptions={usedStatementTypes}
                            onChange={onChange}
                            autoFocus={false}
                            openMenuOnFocus={false}
                            defaultValue={template ?? undefined}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="tertiary" onPress={toggle}>
                            Cancel
                        </Button>
                        <Button autoFocus onPress={handleAdd}>
                            Add
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};
export default StatementTypeModal;
