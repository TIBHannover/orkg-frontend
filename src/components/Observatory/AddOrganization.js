import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getAllOrganizations } from 'services/backend/organizations';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { updateObservatoryOrganization } from 'services/backend/observatories';
import Select from 'react-select';

function AddOrganization(props) {
    const user = useSelector(state => state.auth.user);
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganizations, setSelectedOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadOrganizations = async () => {
            await getAllOrganizations()
                .then(organizations => {
                    setOrganizations(organizations);
                })
                .catch(error => {
                    console.log(error);
                });
        };
        loadOrganizations();
    }, []);

    const handleSubmit = async e => {
        setIsLoading(true);
        if (selectedOrganizations.length > 0) {
            const newSelectedOrganizations = selectedOrganizations.filter(o1 => !props.organizations.find(o2 => o1.id === o2.id));
            await updateObservatoryOrganization(props.id, newSelectedOrganizations)
                .then(_ => {
                    toast.success('Organization added successfully');
                    setIsLoading(false);
                    props.updateObservatoryOrganizations(selectedOrganizations);
                    props.toggle();
                })
                .catch(error => {
                    setIsLoading(false);
                });
        } else {
            toast.error('Please select an organization');
            setIsLoading(false);
        }
    };

    const handleCreatorsChange = selected => {
        setSelectedOrganizations(selected);
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
                            isMulti
                            defaultValue={props.organizations}
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
    updateObservatoryOrganizations: PropTypes.func
};

export default AddOrganization;
