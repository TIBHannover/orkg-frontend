import Tooltip from 'components/Utils/Tooltip';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { updateAbstract } from 'slices/addPaperSlice';

const AbstractModal = ({ toggle }) => {
    const [abstract, setAbstract] = useState('');
    const abstractStore = useSelector(state => state.addPaper.abstract);
    const dispatch = useDispatch();

    useEffect(() => {
        setAbstract(abstractStore);
    }, [abstractStore]);

    const handleSave = () => {
        dispatch(updateAbstract(abstract));
        toggle();
    };

    const stripLineBreaks = event => {
        event.preventDefault();
        let text = '';
        if (event.clipboardData || event.originalEvent.clipboardData) {
            text = (event.originalEvent || event).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        // strip line breaks
        text = text.replace(/\r?\n|\r/g, ' ');
        setAbstract(abstract + text);
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Abstract</ModalHeader>
            <ModalBody>
                <Label for="paper-abstract">
                    <Tooltip message="Enter the paper abstract to get better suggestions for you paper">Paper abstract</Tooltip>
                </Label>
                <Textarea
                    id="paper-abstract"
                    className="form-control ps-2 pe-2"
                    minRows={8}
                    value={abstract}
                    onChange={e => setAbstract(e.target.value)}
                    onPaste={stripLineBreaks}
                />
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button color="primary" className="float-end" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

AbstractModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    paperId: PropTypes.string.isRequired,
    onCreateContribution: PropTypes.func.isRequired,
};

export default AbstractModal;
