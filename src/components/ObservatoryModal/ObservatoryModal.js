import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import AutoCompleteObservatory from 'components/AutocompleteObservatory/AutocompleteObservatory';
import { addResourceToObservatory } from 'services/backend/resources';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const ObservatoryModal = props => {
    const [observatory, setObservatory] = useState(props.observatory);
    const [organization, setOrganization] = useState(props.organization);

    useEffect(() => {
        setObservatory(props.observatory);
    }, [props.observatory]);

    useEffect(() => {
        setOrganization(props.organization);
    }, [props.organization]);

    const handleChangeObservatory = select => {
        setObservatory(select);
    };

    const handleChangeOrganization = select => {
        setOrganization(select);
    };

    const handleSubmit = async () => {
        if (observatory && observatory.id && organization && organization.id) {
            await addResourceToObservatory({
                observatory_id: observatory.id,
                organization_id: organization.id,
                id: props.resourceId
            }).then(l => {
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
                <AutoCompleteObservatory
                    onChangeObservatory={handleChangeObservatory}
                    onChangeOrganization={handleChangeOrganization}
                    observatory={observatory}
                    organization={organization}
                />
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
    observatory: PropTypes.object,
    organization: PropTypes.object,
    callBack: PropTypes.func.isRequired
};

export default ObservatoryModal;
