import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { type RosettaStoneTemplateOption } from 'components/RosettaStone/AddStatement/SelectOption';
import StatementTypeAutocomplete from 'components/RosettaStone/AddStatement/StatementTypeAutocomplete';
import useUsedStatementTypes from 'components/RosettaStone/hooks/useUsedStatementTypes';
import NewStatementTypeModal from 'components/RosettaStone/NewStatementTypeModal/NewStatementTypeModal';
import RosettaTemplateEditorProvider from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { StyledButton } from 'components/StatementBrowser/styled';
import { FC, useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';
import { ButtonGroup, InputGroup } from 'reactstrap';

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
                <ButtonGroup>
                    <ButtonWithLoading color="secondary" onClick={() => setShowAdd(true)}>
                        <FontAwesomeIcon className="icon" icon={faPlus} /> Add statement
                    </ButtonWithLoading>
                </ButtonGroup>
            ) : (
                <InputGroup>
                    <span className="input-group-text">
                        <FontAwesomeIcon className="icon" icon={faPlus} />
                    </span>

                    <StatementTypeAutocomplete additionalOptions={usedStatementTypes} onChange={onChange} />
                    <StyledButton className="w-auto" outline onClick={() => setShowAdd(false)}>
                        Cancel
                    </StyledButton>
                </InputGroup>
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
