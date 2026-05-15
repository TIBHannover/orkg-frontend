import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Label, Modal, TextField, toast } from '@heroui/react';
import capitalize from 'capitalize';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { updateOrganization } from '@/services/backend/organizations';

const URL_REGEX = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;

type EditOrganizationProps = {
    showDialog: boolean;
    toggle: () => void;
    label: string;
    id: string;
    url: string;
    previewSrc: string;
    updateOrganizationMetadata: (label: string, url: string, logo: string) => void;
    typeName: string;
};

const EditOrganization: FC<EditOrganizationProps> = ({ showDialog, toggle, label, id, url, previewSrc, updateOrganizationMetadata, typeName }) => {
    const [organizationLabel, setOrganizationLabel] = useState('');
    const [organizationUrl, setOrganizationUrl] = useState('');
    const [organizationPreviewSrc, setOrganizationPreviewSrc] = useState('');
    const [newLogo, setNewLogo] = useState<File | string>('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setOrganizationLabel(label);
        setOrganizationUrl(url);
        setOrganizationPreviewSrc(previewSrc);
    }, [label, url, previewSrc]);

    const handlePreview = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const [file] = e.target.files;
        setNewLogo(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setOrganizationPreviewSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        const value = organizationLabel;
        const image = organizationPreviewSrc;
        const orgUrl = organizationUrl;

        toast.clear();

        if (value !== label && value.length === 0) {
            toast.danger('Please enter an organization name');
            return;
        }
        if (orgUrl !== url && !orgUrl.match(URL_REGEX)) {
            toast.danger('Please enter a valid organization url');
            return;
        }
        if (image !== previewSrc && image.length === 0) {
            toast.danger('Please upload an organization image');
            return;
        }

        const data: { name?: string; url?: string; logo?: File | string } = {};
        if (value !== label && value.length !== 0) {
            data.name = value;
        }
        if (orgUrl !== url && orgUrl.match(URL_REGEX)) {
            data.url = orgUrl;
        }
        if (image !== previewSrc && image.length !== 0) {
            data.logo = newLogo;
        }

        if (Object.keys(data).length === 0) {
            toggle();
            return;
        }

        setIsSaving(true);
        try {
            await updateOrganization(id, data as Parameters<typeof updateOrganization>[1]);
            toast.success(`${typeName} updated successfully`);
            updateOrganizationMetadata(value, orgUrl, image !== previewSrc && image.length !== 0 ? image : previewSrc);
            toggle();
        } catch {
            toast.warning(`Something went wrong while updating ${typeName}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal.Backdrop
            isOpen={showDialog}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Update {typeName}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6">
                        <div className="flex flex-col gap-4">
                            <TextField fullWidth name="label" value={organizationLabel} onChange={setOrganizationLabel} isDisabled={isSaving}>
                                <Label>{capitalize(typeName)} name</Label>
                                <Input placeholder={`${typeName} name`} maxLength={MAX_LENGTH_INPUT} />
                            </TextField>

                            <TextField fullWidth name="url" value={organizationUrl} onChange={setOrganizationUrl} isDisabled={isSaving}>
                                <Label>{capitalize(typeName)} URL</Label>
                                <Input placeholder="https://www.example.com" maxLength={MAX_LENGTH_INPUT} />
                            </TextField>

                            <div className="flex flex-col gap-2">
                                <Label>Logo</Label>
                                <div className="flex items-center gap-3">
                                    {organizationPreviewSrc && (
                                        <div className="size-20 rounded-[var(--radius)] border border-border bg-default/30 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={organizationPreviewSrc}
                                                className="max-w-full max-h-full object-contain"
                                                alt={`${typeName} logo preview`}
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <Button variant="secondary" size="sm" isDisabled={isSaving} onPress={() => fileInputRef.current?.click()}>
                                            <FontAwesomeIcon icon={faUpload} className="me-2" />
                                            {organizationPreviewSrc ? 'Change logo' : 'Upload logo'}
                                        </Button>
                                        {newLogo instanceof File && <span className="text-xs text-muted truncate max-w-[14rem]">{newLogo.name}</span>}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        aria-label={`${typeName} logo`}
                                        disabled={isSaving}
                                        onChange={handlePreview}
                                        className="sr-only"
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonWithLoading variant="primary" isLoading={isSaving} onPress={handleSubmit}>
                            Save
                        </ButtonWithLoading>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default EditOrganization;
