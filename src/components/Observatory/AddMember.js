import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { addUserToObservatory } from 'services/backend/users';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import { get_error_message } from 'utils';
import Select from 'react-select';

function AddMember(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState(props.organizationsList.length === 1 ? props.organizationsList[0] : null);
    const [email, setEmail] = useState('');

    const handleSubmit = async () => {
        setIsLoading(true);
        if (selectedOrganization && email.length > 0) {
            await addUserToObservatory(email, props.observatoryId, selectedOrganization.id)
                .then(member => {
                    toast.success('Member added successfully');
                    props.updateObservatoryMembers(member);
                    setIsLoading(false);
                    setSelectedOrganization(props.organizationsList.length === 1 ? props.organizationsList[0] : null);
                    setEmail('');
                    props.toggle();
                })
                .catch(error => {
                    toast.error(`Error adding member! ${get_error_message(error, 'user_email') ?? error?.message}`);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
            toast.error('Organization or user email is missing');
        }
    };

    useEffect(() => {
        setSelectedOrganization(props.organizationsList.length === 1 ? props.organizationsList[0] : null);
    }, [props.organizationsList]);

    return (
        <>
            <Modal isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>Add a member</ModalHeader>
                <ModalBody>
                    <>
                        <FormGroup>
                            <Label for="organization">Organization</Label>
                            <Select
                                value={props.organizationsList.length === 1 ? props.organizationsList[0] : selectedOrganization}
                                options={props.organizationsList}
                                onChange={selected => setSelectedOrganization(selected)}
                                getOptionValue={({ id }) => id}
                                getOptionLabel={({ name }) => name}
                                inputId="organization"
                                classNamePrefix="react-select"
                            />
                            <SelectGlobalStyle />
                        </FormGroup>
                        <FormGroup>
                            <Label for="userEmail">User email</Label>

                            <InputGroup>
                                <Input id="userEmail" onChange={e => setEmail(e.target.value)} type="email" value={email} />
                            </InputGroup>
                        </FormGroup>
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

AddMember.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    observatoryId: PropTypes.string,
    organizationsList: PropTypes.array,
    updateObservatoryMembers: PropTypes.func
};

export default AddMember;
