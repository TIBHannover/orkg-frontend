import { createRef, Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { updateObservatoryName, updateObservatoryDescription, updateObservatoryResearchField } from 'services/backend/observatories';
import { isEqual } from 'lodash';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { ENTITIES, CLASSES } from 'constants/graphSettings';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { getContributors } from 'services/backend/contributors';
import AddContributorCard from 'components/ContributorCard/AddContributorCard';

class AddMember extends Component {
    constructor(props) {
        super(props);
        this.resourceInputRef = createRef();
        this.state = {
            contributors: []
        };
    }

    componentDidMount() {
        getContributors()
            .then(contributors => {
                this.setState({ contributors: contributors });
            })
            .catch(error => {
                console.log(error);
            });
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = async e => {};

    render() {
        const isLoading = this.state.isLoadingName;
        return (
            <>
                <Modal size="lg" isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Add a member</ModalHeader>
                    <ModalBody>
                        <>
                            <div className="clearfix">
                                {this.state.contributors.map((user, index) => {
                                    return (
                                        <div key={`moc${index}`}>
                                            <AddContributorCard
                                                contributor={{
                                                    ...user
                                                }}
                                            />
                                            {this.state.contributors.length - 1 !== index && <hr style={{ width: '90%', margin: '10px auto' }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    </ModalBody>
                    <ModalFooter>
                        <div className="text-align-center mt-2">
                            <Button color="primary" disabled={isLoading} onClick={this.handleSubmit}>
                                {isLoading && <span className="fa fa-spinner fa-spin" />} Save
                            </Button>
                        </div>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

AddMember.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    description: PropTypes.string,
    researchField: PropTypes.object,
    updateObservatoryMetadata: PropTypes.func.isRequired
};

export default AddMember;
