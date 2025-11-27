import { FC } from 'react';

import RosettaTemplateEditor from '@/components/RosettaStone/RosettaTemplateEditor/RosettaTemplateEditor';
import { useRosettaTemplateEditorDispatch } from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

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
            <ModalHeader toggle={toggle}>Statement template editor</ModalHeader>
            <ModalBody>
                <RosettaTemplateEditor
                    saveButtonText="Create and insert statement template"
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
