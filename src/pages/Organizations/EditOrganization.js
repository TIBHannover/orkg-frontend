import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { updateOrganizationName, updateOrganizationUrl, updateOrganizationLogo } from 'services/backend/organizations';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

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
            isLoadingLogo: false
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

        let isUpdatedLabel = false;
        let isUpdatedImage = false;
        let isUpdatedUrl = false;

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

        if (isUpdatedLabel || isUpdatedUrl || isUpdatedImage) {
            toast.success(`Organization updated successfully`);
            this.props.updateOrganizationMetadata(
                value,
                url,
                image !== this.props.previewSrc && image.length !== 0 ? image[0] : this.props.previewSrc
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

    render() {
        const isLoading = this.state.isLoadingName || this.state.isLoadingUrl || this.state.isLoadingLogo;

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
                            <div>
                                <img src={this.state.previewSrc} style={{ width: '20%', height: '20%' }} alt="organization logo" />
                            </div>
                            <FormGroup>
                                <Label>Logo</Label>
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
    updateOrganizationMetadata: PropTypes.func.isRequired
};

export default EditOrganization;
