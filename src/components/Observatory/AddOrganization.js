import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getAllOrganizations } from 'services/backend/organizations';
import { useState, useEffect } from 'react';
import { addOrganizationToObservatory } from 'services/backend/observatories';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import Select from 'react-select';
import { differenceBy } from 'lodash';

function AddOrganization(props) {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
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
            await addOrganizationToObservatory(props.id, selectedOrganization.id)
                .then(_ => {
                    toast.success('Organization added successfully');
                    setIsLoading(false);
                    props.toggleOrganizationItem(selectedOrganization);
                    setSelectedOrganization(null);
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

    return (
        <>
            <Modal isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>Add an organization</ModalHeader>
                <ModalBody>
                    <>
                        <Select
                            options={organizations}
                            onChange={selected => setSelectedOrganization(selected)}
                            getOptionValue={({ id }) => id}
                            getOptionLabel={({ name }) => name}
                            classNamePrefix="react-select"
                        />
                        <SelectGlobalStyle />
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
    toggleOrganizationItem: PropTypes.func.isRequired
};

export default AddOrganization;
