import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, Input } from 'reactstrap';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { getContributors } from 'services/backend/contributors';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { updateUserObservatory } from 'services/backend/users';
import styled from 'styled-components';
import Select, { components } from 'react-select';
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

const styles = theme => ({
    textField: {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingBottom: 0,
        marginTop: 0,
        fontWeight: 500
    },
    input: {
        color: 'white'
    }
});

function AddMember(props) {
    const user = useSelector(state => state.auth.user);
    const [contributors, setContributors] = useState([]);
    const [selectedContributors, setSelectedContributors] = useState([]);
    useEffect(() => {
        const loadContributors = async () => {
            await getContributors()
                .then(contributors => {
                    setContributors(contributors.sort((a, b) => (a.observatory_id === props.id ? -1 : 1)));
                    //setSelectedContributors(props.members);
                })
                .catch(error => {
                    console.log(error);
                });
        };
        setSelectedContributors(props.members);
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
            const newSelectedContributors = selectedContributors.filter(o1 => !props.members.find(o2 => o1.id === o2.id));
            const deleted = props.members.filter(o1 => !selectedContributors.find(o2 => o1.id === o2.id));
            //console.log(newSelected);
            //console.log(deleted);
            newSelectedContributors.map(c => {
                c.observatory_id = props.id;
                c.organization_id = props.organizationId;
            });

            deleted.map(c => {
                c.observatory_id = MISC.UNKNOWN_ID;
                c.organization_id = MISC.UNKNOWN_ID;
            });
            console.log(newSelectedContributors.concat(deleted));
            await updateUserObservatory(newSelectedContributors.concat(deleted)).then(response => {
                toast.success(response.status);
                props.updateObservatoryMembers(selectedContributors);
                props.toggle();
            });
        } else {
            toast.error('Please select contributors');
        }
    };
    //const handleCreatorsChange = (v, contributors) => {
    //setSelectedContributors(contributors);
    //};

    const handleCreatorsChange = selected => {
        console.log(selected);
        setSelectedContributors(selected);
    };

    const isLoading = false;
    return (
        <>
            <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
                <ModalHeader toggle={props.toggle}>Add a member</ModalHeader>
                <ModalBody>
                    <>
                        {/* <FormGroup> */}
                        {/* <Label for="Member">Members</Label> */}
                        {/* <Autocomplete */}
                        {/* multiple */}
                        {/* id="tags-outlined" */}
                        {/* options={contributors} */}
                        {/* getOptionLabel={option => option.display_name} */}
                        {/* defaultValue={contributors.slice(0, props.members.length).map(c => c)} */}
                        {/* filterSelectedOptions */}
                        {/* renderInput={params => <TextField {...params} variant="outlined" placeholder="Contributors" />} */}
                        {/* onChange={(e, option) => handleCreatorsChange(e, option)} */}
                        {/* /> */}
                        {/* </FormGroup> */}
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
