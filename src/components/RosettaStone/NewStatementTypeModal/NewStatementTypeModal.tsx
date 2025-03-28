import { FC } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import RosettaTemplateEditor from '@/components/RosettaStone/RosettaTemplateEditor/RosettaTemplateEditor';
import { useRosettaTemplateEditorDispatch } from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';

type NewStatementTypeModalProps = {
    initialLabel: string;
    isOpen: boolean;
    toggle: () => void;
    handleStatementSelect: (template: string) => void;
};

const NewStatementTypeModal: FC<NewStatementTypeModalProps> = ({ initialLabel, isOpen, toggle, handleStatementSelect }) => {
    const dispatch = useRosettaTemplateEditorDispatch();

    return (
        <Modal
            backdrop="static"
            onOpened={() => {
                dispatch({ type: 'initState', payload: null });
                dispatch({ type: 'setLabel', payload: initialLabel ?? '' });
            }}
            isOpen={isOpen}
            toggle={toggle}
            size="lg"
        >
            <ModalHeader toggle={toggle}>Statement type editor</ModalHeader>
            <ModalBody>
                <RosettaTemplateEditor
                    saveButtonText="Create and insert statement type"
                    onCancel={toggle}
                    onCreate={(templateID) => {
                        handleStatementSelect(templateID);
                        toggle();
                    }}
                />
            </ModalBody>
        </Modal>
    );
};

export default NewStatementTypeModal;
