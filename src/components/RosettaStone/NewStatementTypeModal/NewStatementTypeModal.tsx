'use client';

import { Modal } from '@heroui/react';
import { FC, useEffect } from 'react';

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

    useEffect(() => {
        if (isOpen) {
            dispatch({ type: 'initState', payload: null });
            dispatch({ type: 'setLabel', payload: initialLabel ?? '' });
        }
    }, [isOpen, initialLabel, dispatch]);

    return (
        <Modal.Backdrop
            isDismissable={false}
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="lg" className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-3xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Statement template editor</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <RosettaTemplateEditor
                            saveButtonText="Create and insert statement template"
                            onCancel={toggle}
                            onCreate={(templateID) => {
                                handleStatementSelect(templateID);
                                toggle();
                            }}
                        />
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default NewStatementTypeModal;
