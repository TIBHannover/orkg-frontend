import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getAllOrganizations } from 'services/backend/organizations';
import { useState, useEffect } from 'react';
import { updateObservatoryOrganization } from 'services/backend/observatories';
import Select from 'react-select';
import { differenceBy } from 'lodash';

function AddOrganization(props) {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadOrganizations = async () => {
            await getAllOrganizations()
                .then(organizations => {
                    setOrganizations(differenceBy(organizations, props.organizations, 'id'));
                })
                .catch(error => {
                    console.log(error);
                });
        };
        loadOrganizations();
    }, [props.organizations]);

    const handleSubmit = async e => {
        setIsLoading(true);
        if (selectedOrganization) {
            await updateObservatoryOrganization(props.id, selectedOrganization.id)
                .then(_ => {
                    toast.success('Organization added successfully');
                    setIsLoading(false);
                    props.updateOrganizationsList(selectedOrganization, true);
                    props.toggle();
                })
                .catch(error => {
                    toast.error('Organization cannot be added');
                    setIsLoading(false);
                });
        } else {
            toast.error('Please select an organization');
            setIsLoading(false);
        }
    };

    const handleCreatorsChange = selected => {
        setSelectedOrganization(selected);
    };

    return (
        <>
            <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>Add an organization</ModalHeader>
                <ModalBody>
                    <>
                        <Select
                            options={organizations}
                            onChange={handleCreatorsChange}
                            getOptionValue={({ id }) => id}
                            getOptionLabel={({ name }) => name}
                            classNamePrefix="react-select"
                        />
                    </>
                </ModalBody>
                <ModalFooter>
                    <div className="text-align-center mt-2">
                        <Button color="primary" disabled={isLoading} onClick={() => handleSubmit()}>
                            {isLoading && <span className="fa fa-spinner fa-spin" />} Save
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
}

AddOrganization.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    id: PropTypes.string,
    organizations: PropTypes.array,
    updateOrganizationsList: PropTypes.func.isRequired
};

export default AddOrganization;
