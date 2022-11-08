import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { updateOrganizationName, updateOrganizationUrl, updateOrganizationLogo } from 'services/backend/organizations';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import capitalize from 'capitalize';

const EditOrganization = ({ toggle, showDialog, label, id, url, previewSrc, updateOrganizationMetadata, typeName }) => {
    const [organizationLabel, setOrganizationLabel] = useState('');
    const [organizationUrl, setOrganizationUrl] = useState('');
    const [organizationPreviewSrc, setOrganizationPreviewSrc] = useState('');
    const [isLoadingName, setIsLoadingName] = useState(false);
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const [isLoadingLogo, setIsLoadingLogo] = useState(false);

    useEffect(() => {
        setOrganizationLabel(label);
        setOrganizationUrl(url);
        setOrganizationPreviewSrc(previewSrc);
    }, [label, url, previewSrc]);

    const handlePreview = async e => {
        e.preventDefault();

        const file = e.target.files[0];
        const reader = new FileReader();

        if (e.target.files.length === 0) {
            return;
        }

        reader.onloadend = () => {
            setOrganizationPreviewSrc(reader.result);
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async e => {
        const value = organizationLabel;
        const image = organizationPreviewSrc;
        const OrgUrl = organizationUrl;

        let isUpdatedLabel = false;
        let isUpdatedImage = false;
        let isUpdatedUrl = false;

        toast.dismiss();
        const URL_REGEX = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;

        // validate label
        if (value !== label && value.length === 0) {
            toast.error('Please enter an organization name');
            return false;
        }
        // validate url
        if (OrgUrl !== url && !OrgUrl.match(URL_REGEX)) {
            toast.error('Please enter a valid organization url');
            return false;
        }
        // validate image
        if (image !== previewSrc && image.length === 0) {
            toast.error('Please enter an organization image');
            return false;
        }

        if (value !== label && value.length !== 0) {
            await updateName(id, value);
            isUpdatedLabel = true;
        }

        if (OrgUrl !== url && OrgUrl.match(URL_REGEX)) {
            await updateUrl(id, url);
            isUpdatedUrl = true;
        }

        if (image !== previewSrc && image.length !== 0) {
            await updateLogo(id, image[0]);
            isUpdatedImage = true;
        }

        if (isUpdatedLabel || isUpdatedUrl || isUpdatedImage) {
            toast.success(`${typeName} updated successfully`);
            updateOrganizationMetadata(value, url, image !== previewSrc && image.length !== 0 ? image[0] : previewSrc);
            toggle();
        } else {
            toggle();
        }
    };

    const updateName = async (id, name) => {
        setIsLoadingName(true);
        try {
            await updateOrganizationName(id, name);
            setIsLoadingName(false);
        } catch (error) {
            setIsLoadingName(false);
            console.error(error);
            toast.error(`Error updating ${typeName} ${error.message}`);
        }
    };

    const updateUrl = async (id, url) => {
        setIsLoadingUrl(true);
        try {
            await updateOrganizationUrl(id, url);
            setIsLoadingUrl(false);
        } catch (error) {
            setIsLoadingUrl(false);
            console.error(error);
            toast.error(`Error updating ${typeName} ${error.message}`);
        }
    };

    const updateLogo = async (id, image) => {
        setIsLoadingLogo(true);
        try {
            await updateOrganizationLogo(id, image);
            setIsLoadingLogo(false);
        } catch (error) {
            setIsLoadingLogo(false);
            console.error(error);
            toast.error(`Error updating ${typeName} ${error.message}`);
        }
    };

    const isLoading = isLoadingName || isLoadingUrl || isLoadingLogo;
    console.log(isLoading);
    return (
        <>
            <Modal isOpen={showDialog} toggle={toggle}>
                <ModalHeader toggle={toggle}>Update {typeName}</ModalHeader>
                <ModalBody>
                    <>
                        {' '}
                        <FormGroup>
                            <Label for="organizationLabel">{capitalize(typeName)} name</Label>
                            <Input
                                onChange={e => {
                                    console.log(e.target.value);
                                    setOrganizationLabel(e.target.value);
                                }}
                                type="text"
                                name="label"
                                id="organizationLabel"
                                value={organizationLabel}
                                placeholder={`${typeName} name`}
                                disabled={isLoading}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="OrganizationUrl">{capitalize(typeName)} URL</Label>
                            <Input
                                onChange={e => setOrganizationUrl(e.target.value)}
                                type="text"
                                name="url"
                                id="OrganizationUrl"
                                value={organizationUrl}
                                disabled={isLoading}
                                placeholder="https://www.example.com"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Logo</Label>
                            <div>
                                <img src={organizationPreviewSrc} style={{ width: '20%', height: '20%' }} alt="Organization logo" />
                            </div>
                            <br />
                            <Input disabled={isLoading} type="file" onChange={handlePreview} />
                        </FormGroup>
                    </>
                </ModalBody>
                <ModalFooter>
                    <div className="text-align-center mt-2">
                        <Button color="primary" disabled={isLoading} onClick={handleSubmit}>
                            {isLoading && <span className="fa fa-spinner fa-spin" />} Save
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
};

EditOrganization.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string,
    url: PropTypes.string,
    previewSrc: PropTypes.string,
    updateOrganizationMetadata: PropTypes.func.isRequired,
    typeName: PropTypes.string.isRequired,
};

export default EditOrganization;
