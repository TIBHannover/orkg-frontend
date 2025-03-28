import { differenceBy } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { updateObservatory } from '@/services/backend/observatories';
import { getAllOrganizations } from '@/services/backend/organizations';

function AddOrganization(props) {
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganization, setSelectedOrganization] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadOrganizations = async () => {
            await getAllOrganizations()
                .then((organizations) => {
                    setOrganizations(differenceBy(organizations, props.organizations, 'id'));
                })
                .catch((error) => {
                    console.log(error);
                });
        };
        loadOrganizations();
    }, [props.organizations]);

    const handleSubmit = async (e) => {
        setIsLoading(true);
        if (selectedOrganization) {
            await updateObservatory(props.id, { organizations: [...props.organizations.map((o) => o.id), selectedOrganization?.id] })
                .then((_) => {
                    toast.success('Organization added successfully');
                    setIsLoading(false);
                    props.toggleOrganizationItem(selectedOrganization);
                    setSelectedOrganization(null);
                    props.toggle();
                })
                .catch((error) => {
                    toast.error('Organization cannot be added');
                    setIsLoading(false);
                });
        } else {
            toast.error('Please select an organization');
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Add an organization</ModalHeader>
            <ModalBody>
                <>
                    <Select
                        options={organizations}
                        onChange={(selected) => setSelectedOrganization(selected)}
                        getOptionValue={({ id }) => id}
                        getOptionLabel={({ name }) => name}
                        classNamePrefix="react-select"
                    />
                    <SelectGlobalStyle />
                </>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    <ButtonWithLoading color="primary" isLoading={isLoading} onClick={() => handleSubmit()}>
                        Save
                    </ButtonWithLoading>
                </div>
            </ModalFooter>
        </Modal>
    );
}

AddOrganization.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    id: PropTypes.string,
    organizations: PropTypes.array,
    toggleOrganizationItem: PropTypes.func.isRequired,
};

export default AddOrganization;
