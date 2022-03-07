import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Input, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { updateUserObservatory } from 'services/backend/users';
import Select from 'react-select';

function AddMember(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrganization, setSelectedOrganization] = useState('');
    const [text, setText] = useState('');

    useEffect(() => {}, []);

    const handleSubmit = () => {
        setIsLoading(true);
        if (selectedOrganization && text.length > 0) {
            updateObservatory(text);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            toast.error('Organization or user email is missing');
        }
    };

    const updateObservatory = async user => {
        await updateUserObservatory(user, props.id, selectedOrganization.id)
            .then(member => {
                toast.success('Member added successfully');
                props.updateObservatoryMembers(member);
                setIsLoading(false);
                props.toggle();
            })
            .catch(error => {
                toast.error(`error adding member ${error.message}`);
                setIsLoading(false);
            });
    };

    const handleCreatorChange = e => {
        setText(e);
    };

    const handleOrganizationChange = selected => {
        setSelectedOrganization(selected);
    };

    return (
        <>
            <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>Add a member</ModalHeader>
                <ModalBody>
                    <>
                        Organization
                        <Select
                            options={props.organizationsList}
                            onChange={handleOrganizationChange}
                            getOptionValue={({ id }) => id}
                            getOptionLabel={({ name }) => name}
                            classNamePrefix="react-select"
                        />
                        <br />
                        <div>
                            Email
                            <FormGroup>
                                <InputGroup>
                                    <Input id="search_content" onChange={e => handleCreatorChange(e.target.value)} type="email" value={text} />
                                </InputGroup>
                            </FormGroup>
                        </div>
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
    id: PropTypes.string,
    organizationsList: PropTypes.object,
    updateObservatoryMembers: PropTypes.func
};

export default AddMember;
