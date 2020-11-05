import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import AutoCompleteObservatory from 'components/AutocompleteObservatory/AutocompleteObservatory';
import { addResourceToObservatory } from 'services/backend/resources';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ObservatoryModal = props => {
    const [observatory, setObservatory] = useState(null);

    const handleInputChange = select => {
        setObservatory(select);
    };
    const handleSubmit = async () => {
        if (observatory.organizationId && observatory.value) {
            await addResourceToObservatory(observatory.value, observatory.organizationId, props.resourceId).then(l => {
                toast.success(`Observatory added to paper successfully`);
                props.callBack();
                props.toggle();
            });
        } else {
            toast.error(`Please select an observatory`);
        }
    };

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Assign resource to an Observatory</ModalHeader>
            <ModalBody>
                <p>Select an observatory:</p>
                <AutoCompleteObservatory onChange={handleInputChange} />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSubmit}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ObservatoryModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    resourceId: PropTypes.string.isRequired,
    value: PropTypes.object,
    callBack: PropTypes.func.isRequired
};

export default ObservatoryModal;
