import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label } from 'reactstrap';
import AutoCompleteObservatory from 'components/AutocompleteObservatory/AutocompleteObservatory';
import { addResourceToObservatory } from 'services/backend/resources';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { MISC } from 'constants/graphSettings';

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
        await addResourceToObservatory({
            observatory_id: observatory?.id ?? MISC.UNKNOWN_ID,
            organization_id: organization?.id ?? MISC.UNKNOWN_ID,
            id: props.resourceId
        }).then(() => {
            toast.success(`Observatory added to paper successfully`);
            props.callBack && props.callBack(observatory?.id ?? MISC.UNKNOWN_ID, organization?.id ?? MISC.UNKNOWN_ID);
            props.toggle();
        });
    };

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Assign resource to an observatory</ModalHeader>
            <ModalBody>
                <Label for="select-observatory">Select an observatory</Label>
                <AutoCompleteObservatory
                    onChangeObservatory={handleChangeObservatory}
                    onChangeOrganization={handleChangeOrganization}
                    observatory={observatory}
                    organization={organization}
                    inputId="select-observatory"
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
    callBack: PropTypes.func
};

export default ObservatoryModal;
