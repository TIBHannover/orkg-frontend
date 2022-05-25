import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { updateResource } from 'services/backend/resources';

function EditTitleModal({ isOpen, toggle, editItem, onChange }) {
    const [title, setTitle] = useState(editItem.label);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!title || !title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        setIsLoading(true);
        await updateResource(editItem.id, title);
        onChange({ title, editItem });
        toast.success('The title has been updated successfully');
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Edit draft comparison title</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="draft-title">Title</Label>
                    <Input type="text" id="draft-title" value={title} onChange={e => setTitle(e.target.value)} />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" disabled={isLoading} onClick={handleSave}>
                    {isLoading && <Icon icon={faSpinner} spin />} Save
                </Button>
            </ModalFooter>
        </Modal>
    );
}

EditTitleModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    editItem: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default EditTitleModal;
