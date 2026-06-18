import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal, Tooltip } from '@heroui/react';
import { ClipboardEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';

import TitleWarningAlert from '@/components/ViewPaper/AbstractModal/TitleWarningAlert';
import { RootStore } from '@/slices/types';
import { setAbstract as setAbstractStore } from '@/slices/viewPaperSlice';

type AbstractModalProps = {
    toggle: () => void;
};

const AbstractModal: FC<AbstractModalProps> = ({ toggle }) => {
    const [abstract, setAbstract] = useState('');
    const abstractStore = useSelector((state: RootStore) => state.viewPaper.abstract);
    const dispatch = useDispatch();

    useEffect(() => {
        setAbstract(abstractStore);
    }, [abstractStore]);

    const handleSave = () => {
        dispatch(setAbstractStore(abstract));
        toggle();
    };

    const stripLineBreaks = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain').replace(/\r?\n|\r/g, ' ');
        setAbstract(abstract + text);
    };

    return (
        <Modal.Backdrop
            isOpen
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-2xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Abstract</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="flex flex-col gap-3">
                            <TitleWarningAlert />
                            <Alert status="accent">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Abstract is not stored</Alert.Title>
                                    <Alert.Description>
                                        Paper abstracts are only used to generate better suggestions and are not stored in the ORKG. After reloading
                                        the page, the abstract will be lost.
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="paper-abstract" className="text-sm font-medium inline-flex items-center gap-1">
                                    Paper abstract
                                    <Tooltip delay={0}>
                                        <Tooltip.Trigger>
                                            <FontAwesomeIcon icon={faQuestionCircle} className="text-muted cursor-help" />
                                        </Tooltip.Trigger>
                                        <Tooltip.Content showArrow>
                                            <Tooltip.Arrow />
                                            Enter the paper abstract to get better suggestions for your paper
                                        </Tooltip.Content>
                                    </Tooltip>
                                </label>
                                <Textarea
                                    id="paper-abstract"
                                    className="w-full px-3 py-2 rounded-md border border-border bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-focus/40"
                                    minRows={8}
                                    value={abstract}
                                    onChange={(e) => setAbstract(e.target.value)}
                                    onPaste={stripLineBreaks}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onPress={handleSave}>
                            Fetch suggestions
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default AbstractModal;
