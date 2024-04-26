import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from 'reactstrap';
import { updateOrganization } from 'services/backend/organizations';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import capitalize from 'capitalize';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { MAX_LENGTH_INPUT } from 'constants/misc';

const EditOrganization = ({ toggle, showDialog, label, id, url, previewSrc, updateOrganizationMetadata, typeName }) => {
    const [organizationLabel, setOrganizationLabel] = useState('');
    const [organizationUrl, setOrganizationUrl] = useState('');
    const [organizationPreviewSrc, setOrganizationPreviewSrc] = useState('');
    const [newLogo, setNewLogo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setOrganizationLabel(label);
        setOrganizationUrl(url);
        setOrganizationPreviewSrc(previewSrc);
    }, [label, url, previewSrc]);

    const handlePreview = async (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        const reader = new FileReader();

        if (e.target.files.length === 0) {
            return;
        }

        setNewLogo(file);

        reader.onloadend = () => {
            setOrganizationPreviewSrc(reader.result);
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        const value = organizationLabel;
        const image = organizationPreviewSrc;
        const OrgUrl = organizationUrl;

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
            toast.error('Please upload an organization image');
            return false;
        }
        const data = {};
        if (value !== label && value.length !== 0) {
            data.name = value;
        }

        if (OrgUrl !== url && OrgUrl.match(URL_REGEX)) {
            data.url = OrgUrl;
        }

        if (image !== previewSrc && image.length !== 0) {
            data.logo = newLogo;
        }

        if (Object.keys(data).length > 0) {
            try {
                await updateOrganization(id, data);
                setIsSaving(false);
                toast.success(`${typeName} updated successfully`);
                updateOrganizationMetadata(value, OrgUrl, image !== previewSrc && image.length !== 0 ? image : previewSrc);
                toggle();
            } catch {
                toast.warning(`Something went wrong while updating ${typeName}`);
                setIsSaving(false);
            }
        } else {
            toggle();
        }
    };

    return (
        <>
            <Modal isOpen={showDialog} toggle={toggle}>
                <ModalHeader toggle={toggle}>Update {typeName}</ModalHeader>
                <ModalBody>
                    <>
                        <FormGroup>
                            <Label for="organizationLabel">{capitalize(typeName)} name</Label>
                            <Input
                                onChange={(e) => {
                                    setOrganizationLabel(e.target.value);
                                }}
                                type="text"
                                name="label"
                                id="organizationLabel"
                                value={organizationLabel}
                                placeholder={`${typeName} name`}
                                disabled={isSaving}
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="OrganizationUrl">{capitalize(typeName)} URL</Label>
                            <Input
                                onChange={(e) => setOrganizationUrl(e.target.value)}
                                type="text"
                                name="url"
                                id="OrganizationUrl"
                                value={organizationUrl}
                                disabled={isSaving}
                                placeholder="https://www.example.com"
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Logo</Label>
                            <div>
                                <img src={organizationPreviewSrc} style={{ width: '20%', height: '20%' }} alt="Organization logo" />
                            </div>
                            <br />
                            <Input disabled={isSaving} type="file" onChange={handlePreview} />
                        </FormGroup>
                    </>
                </ModalBody>
                <ModalFooter>
                    <div className="text-align-center mt-2">
                        <ButtonWithLoading color="primary" isLoading={isSaving} onClick={handleSubmit}>
                            Save
                        </ButtonWithLoading>
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
