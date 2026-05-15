import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { FC, useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { type RosettaStoneTemplateOption } from '@/components/RosettaStone/AddStatement/SelectOption';
import StatementTypeAutocomplete from '@/components/RosettaStone/AddStatement/StatementTypeAutocomplete';
import useUsedStatementTypes from '@/components/RosettaStone/hooks/useUsedStatementTypes';
import NewStatementTypeModal from '@/components/RosettaStone/NewStatementTypeModal/NewStatementTypeModal';
import RosettaTemplateEditorProvider from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';

type AddStatementProps = {
    context: string;
    handleAddStatement: (templateId: string) => void;
};

const AddStatement: FC<AddStatementProps> = ({ context, handleAddStatement }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialLabel, setInitialLabel] = useState('');

    const { usedStatementTypes } = useUsedStatementTypes({ context });

    const onChange = async (value: SingleValue<RosettaStoneTemplateOption>, actionMeta: ActionMeta<RosettaStoneTemplateOption>) => {
        if (actionMeta.action === 'create-option') {
            setInitialLabel(value?.label ?? '');
            setIsModalOpen(true);
            setShowAdd(false);
        } else if (value?.id) {
            await handleAddStatement(value?.id);
            setShowAdd(false);
        }
    };

    return (
        <div>
            {!showAdd ? (
                <ButtonWithLoading size="sm" className="button--orkg-secondary" onPress={() => setShowAdd(true)}>
                    <FontAwesomeIcon icon={faPlus} /> Add statement
                </ButtonWithLoading>
            ) : (
                <div className="flex items-stretch min-h-9">
                    <span className="inline-flex items-center bg-default border border-border border-e-0 rounded-s-[var(--radius)] px-3 text-sm">
                        <FontAwesomeIcon icon={faPlus} />
                    </span>
                    <div className="flex-1 min-w-0">
                        <StatementTypeAutocomplete additionalOptions={usedStatementTypes} onChange={onChange} />
                    </div>
                    <Button
                        size="sm"
                        variant="tertiary"
                        className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                        onPress={() => setShowAdd(false)}
                    >
                        Cancel
                    </Button>
                </div>
            )}
            <RosettaTemplateEditorProvider>
                <NewStatementTypeModal
                    initialLabel={initialLabel}
                    handleStatementSelect={handleAddStatement}
                    isOpen={isModalOpen}
                    toggle={() => {
                        setIsModalOpen((v) => !v);
                    }}
                />
            </RosettaTemplateEditorProvider>
        </div>
    );
};

export default AddStatement;
