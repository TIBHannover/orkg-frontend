import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getContributors } from 'services/backend/contributors';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { updateUserObservatory } from 'services/backend/users';

function AddMember(props) {
    const user = useSelector(state => state.auth.user);
    const [contributors, setContributors] = useState([]);
    const [selectedContributors, setSelectedContributors] = useState([]);
    useEffect(() => {
        const loadContributors = () => {
            getContributors()
                .then(contributors => {
                    setContributors(contributors.sort((a, b) => (a.observatory_id === props.id ? -1 : 1)));
                })
                .catch(error => {
                    console.log(error);
                });
        };
        loadContributors();
    }, []);

    const useStyles = makeStyles(theme => ({
        root: {
            width: 500,
            '& > * + *': {
                marginTop: theme.spacing(3)
            }
        }
    }));

    const handleSubmit = async e => {
        if (selectedContributors.length > 0) {
            const newSelected = selectedContributors.filter(o1 => !props.members.find(o2 => o1.id === o2.id));
            await updateUserObservatory(newSelected, props.id, props.organizationId).then(response => {
                toast.success(response.status);
                props.updateObservatoryMembers(selectedContributors);
                props.toggle();
            });
        } else {
            toast.error('Please select contributors');
        }
    };
    const handleCreatorsChange = (v, contributors) => {
        setSelectedContributors(contributors);
    };

    const isLoading = false;
    return (
        <>
            <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>Add a member</ModalHeader>
                <ModalBody>
                    <>
                        <div className="clearfix">
                            <Autocomplete
                                multiple
                                id="tags-outlined"
                                options={contributors}
                                getOptionLabel={option => option.display_name}
                                defaultValue={contributors.slice(0, props.members.length).map(c => c)}
                                filterSelectedOptions
                                renderInput={params => <TextField {...params} variant="outlined" placeholder="Favorites" />}
                                onChange={(e, option) => handleCreatorsChange(e, option)}
                            />
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
    organizationId: PropTypes.string,
    members: PropTypes.array,
    updateObservatoryMembers: PropTypes.func
};

export default AddMember;
