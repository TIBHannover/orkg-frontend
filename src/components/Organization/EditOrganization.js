import { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import {
    updateOrganizationName,
    updateOrganizationUrl,
    updateOrganizationLogo,
    updateOrganizationType,
    updateConferenceProcess,
    updateConferenceDate
} from 'services/backend/organizations';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { ORGANIZATIONS_TYPES } from 'constants/organizationsTypes';
import Tooltip from 'components/Utils/Tooltip';

class EditOrganization extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            label: '',
            value: '',
            url: '',
            organizationId: '',
            previewSrc: '',
            isLoadingName: false,
            isLoadingUrl: false,
            isLoadingLogo: false,
            isLoadingType: false,
            isLoadingDate: false,
            isLoadingProcess: false,
            type: '',
            date: '',
            isDoubleBlind: false
        };
    }

    componentDidUpdate = prevProps => {
        if (prevProps.label !== this.props.label) {
            this.setState({ label: this.props.label });
        }

        if (prevProps.url !== this.props.url) {
            this.setState({ url: this.props.url });
        }

        if (prevProps.previewSrc !== this.props.previewSrc) {
            this.setState({ previewSrc: this.props.previewSrc });
        }

        if (prevProps.type !== this.props.type) {
            this.setState({ type: ORGANIZATIONS_TYPES.find(t => this.props.type === t.id)?.id });
        }

        if (prevProps.date !== this.props.date) {
            this.setState({ date: this.props.date });
        }

        if (prevProps.isDoubleBlind !== this.props.isDoubleBlind) {
            this.setState({ isDoubleBlind: this.props.isDoubleBlind });
        }
    };

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handlePreview = async e => {
        e.preventDefault();

        const file = e.target.files[0];
        const reader = new FileReader();

        if (e.target.files.length === 0) {
            return;
        }

        reader.onloadend = e => {
            this.setState({
                previewSrc: [reader.result]
            });
        };

        reader.readAsDataURL(file);
    };

    handleSubmit = async e => {
        const value = this.state.label;
        const image = this.state.previewSrc;
        const url = this.state.url;
        const id = this.props.id;
        const type = this.state.type;
        const date = this.state.date;
        const isDoubleBlind = this.state.isDoubleBlind;

        let isUpdatedLabel = false;
        let isUpdatedImage = false;
        let isUpdatedUrl = false;
        let isUpdatedType = false;
        let isUpdatedDate = false;
        let isUpdatedProcess = false;

        toast.dismiss();
        const URL_REGEX = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;

        // validate label
        if (value !== this.props.label && value.length === 0) {
            toast.error(`Please enter an organization name`);
            return false;
        }
        // validate url
        if (url !== this.props.url && !url.match(URL_REGEX)) {
            toast.error(`Please enter a valid organization url`);
            return false;
        }
        // validate image
        if (image !== this.props.previewSrc && image.length === 0) {
            toast.error(`Please enter an organization image`);
            return false;
        }

        if (type !== this.props.type && type.length === 0) {
            toast.error(`Please enter an organization type`);
            return false;
        }

        if (ORGANIZATIONS_TYPES.find(t => t.id === type)?.requireDate && date.length === 0) {
            toast.error(`Please select conference date`);
            return false;
        }

        if (value !== this.props.label && value.length !== 0) {
            await this.updateOrganizationName(id, value);
            isUpdatedLabel = true;
        }

        if (url !== this.props.url && url.match(URL_REGEX)) {
            await this.updateOrganizationUrl(id, url);
            isUpdatedUrl = true;
        }

        if (image !== this.props.previewSrc && image.length !== 0) {
            await this.updateOrganizationLogo(id, image[0]);
            isUpdatedImage = true;
        }

        if (type !== this.props.type && type.length !== 0) {
            await this.updateOrganizationType(id, type);
            isUpdatedType = true;
        }

        if (isDoubleBlind !== this.props.isDoubleBlind) {
            await this.updateConferenceProcess(id, isDoubleBlind);
            isUpdatedProcess = true;
        }

        if (ORGANIZATIONS_TYPES.find(t => t.id === type)?.requireDate && date !== this.props.date && date.length !== 0) {
            await this.updateConferenceDate(id, date);
            isUpdatedDate = true;
        }

        if (isUpdatedLabel || isUpdatedUrl || isUpdatedImage || isUpdatedType || isUpdatedDate || isUpdatedProcess) {
            toast.success(`Organization updated successfully`);
            this.props.updateOrganizationMetadata(
                value,
                url,
                image !== this.props.previewSrc && image.length !== 0 ? image[0] : this.props.previewSrc,
                type,
                date,
                isDoubleBlind
            );
            this.props.toggle();
        } else {
            this.props.toggle();
        }
    };

    updateOrganizationName = async (id, name) => {
        this.setState({ isLoadingName: true });
        try {
            await updateOrganizationName(id, name);
            this.setState({ isLoadingName: false });
        } catch (error) {
            this.setState({ isLoadingName: false });
            console.error(error);
            toast.error(`Error updating an organization ${error.message}`);
        }
    };

    updateOrganizationUrl = async (id, url) => {
        this.setState({ isLoadingUrl: true });
        try {
            await updateOrganizationUrl(id, url);
            this.setState({ isLoadingUrl: false });
        } catch (error) {
            this.setState({ isLoadingUrl: false });
            console.error(error);
            toast.error(`Error updating an organization ${error.message}`);
        }
    };

    updateOrganizationLogo = async (id, image) => {
        this.setState({ isLoadingLogo: true });
        try {
            await updateOrganizationLogo(id, image);
            this.setState({ isLoadingLogo: false });
        } catch (error) {
            this.setState({ isLoadingLogo: false });
            console.error(error);
            toast.error(`Error updating an organization ${error.message}`);
        }
    };

    updateOrganizationType = async (id, type) => {
        this.setState({ isLoadingType: true });
        try {
            await updateOrganizationType(id, type);
            this.setState({ isLoadingType: false });
        } catch (error) {
            this.setState({ isLoadingType: false });
            console.error(error);
            toast.error(`Error updating an organization ${error.message}`);
        }
    };

    updateConferenceDate = async (id, date) => {
        this.setState({ isLoadingDate: true });
        try {
            await updateConferenceDate(id, date);
            this.setState({ isLoadingDate: false });
        } catch (error) {
            this.setState({ isLoadingDate: false });
            console.error(error);
            toast.error(`Error updating an organization ${error.message}`);
        }
    };

    updateConferenceProcess = async (id, process) => {
        this.setState({ isLoadingProcess: true });
        try {
            await updateConferenceProcess(id, process);
            this.setState({ isLoadingProcess: false });
        } catch (error) {
            this.setState({ isLoadingProcess: false });
            console.error(error);
            toast.error(`Error updating an organization ${error.message}`);
        }
    };

    render() {
        const isLoading =
            this.state.isLoadingName ||
            this.state.isLoadingUrl ||
            this.state.isLoadingLogo ||
            this.state.isLoadingType ||
            this.state.isLoadingProcess ||
            this.state.isLoadingDate;

        return (
            <>
                <Modal isOpen={this.props.showDialog} toggle={this.props.toggle}>
                    <ModalHeader toggle={this.props.toggle}>Update an Organization</ModalHeader>
                    <ModalBody>
                        <>
                            {' '}
                            <FormGroup>
                                <Label for="ResourceLabel">Organization Name</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="label"
                                    id="ResourceLabel"
                                    value={this.state.label}
                                    placeholder="Organization Name"
                                    disabled={isLoading}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="OrganizationUrl">Organization URL</Label>
                                <Input
                                    onChange={this.handleChange}
                                    type="text"
                                    name="url"
                                    id="OrganizationUrl"
                                    value={this.state.url}
                                    disabled={isLoading}
                                    placeholder="https://www.example.com"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="type">Type</Label>
                                <Input
                                    onChange={e => {
                                        this.setState({ type: ORGANIZATIONS_TYPES.find(t => t.id === e.target.value)?.id });
                                    }}
                                    value={this.state.type}
                                    name="type"
                                    type="select"
                                >
                                    {ORGANIZATIONS_TYPES.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>
                            {ORGANIZATIONS_TYPES.find(t => t.id === this.state.type)?.requireDate && (
                                <>
                                    <FormGroup>
                                        <Label for="conferenceDate">Conference date</Label>
                                        <Input
                                            onChange={this.handleChange}
                                            type="date"
                                            name="date"
                                            id="conferenceDate"
                                            value={this.state.date}
                                            placeholder="yyyy-mm-dd"
                                        />
                                    </FormGroup>
                                    <FormGroup check>
                                        <Input
                                            onChange={e => this.setState({ isDoubleBlind: e.target.checked })}
                                            type="checkbox"
                                            name="isDoubleBlind"
                                            id="doubleBlind"
                                            checked={this.state.isDoubleBlind}
                                        />
                                        <Label for="doubleBlind" check>
                                            Double blind
                                            <Tooltip message="By default the conference is considered single-blind." />
                                        </Label>
                                    </FormGroup>
                                </>
                            )}
                            <FormGroup>
                                <Label>Logo</Label>
                                <div>
                                    <img src={this.state.previewSrc} style={{ width: '20%', height: '20%' }} alt="Organization logo" />
                                </div>
                                <br />
                                <Input disabled={isLoading} type="file" onChange={this.handlePreview} />
                            </FormGroup>
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
EditOrganization.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    url: PropTypes.string,
    previewSrc: PropTypes.string,
    updateOrganizationMetadata: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    date: PropTypes.string,
    isDoubleBlind: PropTypes.bool
};

export default EditOrganization;
