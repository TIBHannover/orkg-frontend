import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getContributors } from 'services/backend/contributors';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { updateUserObservatory } from 'services/backend/users';
import styled from 'styled-components';
import Select from 'react-select';
import { MISC } from 'constants/graphSettings';

export const StyledAutoCompleteInputFormControl = styled.div`
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    &.default {
        height: auto !important;
        min-height: calc(1.8125rem + 4px);
    }
    cursor: text;
    padding: 0 !important;
`;

function AddMember(props) {
    const [contributors, setContributors] = useState([]);
    const [selectedContributors, setSelectedContributors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadContributors = async () => {
            await getContributors()
                .then(contributors => {
                    setContributors(contributors);
                })
                .catch(error => {
                    console.log(error);
                });
        };
        loadContributors();
    }, []);

    const handleSubmit = async e => {
        setIsLoading(true);
        if (selectedContributors && selectedContributors.length > 0) {
            //retrieve the recently selected members
            const newSelectedContributors = selectedContributors.filter(o1 => !props.members.find(o2 => o1.id === o2.id));
            //retrieve the members which have been unselected from the list
            const deleted = props.members.filter(o1 => !selectedContributors.find(o2 => o1.id === o2.id));

            newSelectedContributors.map(c => {
                c.observatory_id = props.id;
                c.organization_id = props.organizationId;
            });

            deleted.map(c => {
                c.observatory_id = MISC.UNKNOWN_ID;
                c.organization_id = MISC.UNKNOWN_ID;
            });
            updateObservatory(newSelectedContributors.concat(deleted), selectedContributors);
        } else if (props.members && props.members.length > 0) {
            const deleted = props.members;
            deleted.map(c => {
                c.observatory_id = MISC.UNKNOWN_ID;
                c.organization_id = MISC.UNKNOWN_ID;
            });
            updateObservatory(deleted, []);
        } else {
            toast.error('Please select observatory members');
            setIsLoading(false);
        }
    };

    const updateObservatory = async (data, updatedMembers) => {
        await updateUserObservatory(data)
            .then(response => {
                toast.success(response.status);
                props.updateObservatoryMembers(updatedMembers);
                setIsLoading(false);
                props.toggle();
            })
            .catch(error => {
                setIsLoading(false);
            });
    };

    const handleCreatorsChange = selected => {
        setSelectedContributors(selected);
    };

    return (
        <>
            <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>Add a member</ModalHeader>
                <ModalBody>
                    <>
                        <Select
                            options={contributors}
                            onChange={handleCreatorsChange}
                            getOptionValue={({ id }) => id}
                            getOptionLabel={({ display_name }) => display_name}
                            isMulti
                            defaultValue={props.members}
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

AddMember.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    id: PropTypes.string,
    organizationId: PropTypes.string,
    members: PropTypes.array,
    updateObservatoryMembers: PropTypes.func
};

export default AddMember;
