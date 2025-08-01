import { ClipboardEvent, FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import { Alert } from 'reactstrap';

import Button from '@/components/Ui/Button/Button';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Tooltip from '@/components/Utils/Tooltip';
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
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Abstract</ModalHeader>
            <ModalBody>
                <TitleWarningAlert />
                <Alert color="info">
                    Paper abstracts are only used to generate better suggestions and are not stored in the ORKG. After reloading the page, the
                    abstract will be lost
                </Alert>
                <Label for="paper-abstract">
                    <Tooltip message="Enter the paper abstract to get better suggestions for you paper">Paper abstract</Tooltip>
                </Label>
                <Textarea
                    id="paper-abstract"
                    className="form-control ps-2 pe-2"
                    minRows={8}
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    onPaste={stripLineBreaks}
                />
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button color="primary" className="float-end" onClick={handleSave}>
                    Fetch suggestions
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AbstractModal;
