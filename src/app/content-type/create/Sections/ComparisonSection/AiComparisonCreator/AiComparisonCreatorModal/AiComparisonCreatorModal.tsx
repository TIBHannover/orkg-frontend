'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal, toast } from '@heroui/react';
import type { JobRead } from '@orkg/agentic-loop-client';
import { sendEvent } from '@socialgouv/matomo-next';
import { uniqueId } from 'lodash';
import { useState } from 'react';

import DragUploadPdf from '@/components/DragUploadPdf/DragUploadPdf';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import { createAiJob } from '@/services/agenticLoop/api';

type AiComparisonCreatorModalProps = {
    isOpen: boolean;
    toggle: () => void;
    onJobCreated: (job: JobRead) => void;
};

type StagedFile = {
    id: string;
    file: File;
};

// Client-side guard on the total upload size before posting straight to the service.
const MAX_TOTAL_UPLOAD_BYTES = 50 * 1024 * 1024;

const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
};

const AiComparisonCreatorModal = ({ isOpen, toggle, onJobCreated }: AiComparisonCreatorModalProps) => {
    const [files, setFiles] = useState<StagedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const totalBytes = files.reduce((sum, entry) => sum + entry.file.size, 0);
    const isOverLimit = totalBytes > MAX_TOTAL_UPLOAD_BYTES;

    const handleDrop = (accepted: File[]) => {
        setFiles((prev) => [...prev, ...accepted.map((file) => ({ id: uniqueId('file-'), file }))]);
    };

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((entry) => entry.id !== id));
    };

    const handleClose = () => {
        if (isUploading) return;
        setFiles([]);
        toggle();
    };

    const handleSubmit = async () => {
        if (files.length === 0 || isOverLimit) return;
        setIsUploading(true);
        try {
            const result = await createAiJob(files.map((entry) => entry.file));
            if (!result.ok) {
                toast.danger(result.error);
                return;
            }
            sendEvent({ category: 'data-entry', action: 'create-ai-comparison', name: files.length.toString() });
            onJobCreated(result.data);
            setFiles([]);
        } catch (e) {
            toast.danger(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ModalWithLoading isOpen={isOpen} toggle={handleClose} size="lg" isLoading={isUploading}>
            <Modal.Header>
                <Modal.CloseTrigger />
                <Modal.Heading>AI comparison creator</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
                <Alert status="accent" className="mb-3">
                    <Alert.Content>
                        <Alert.Title>Create comparisons from papers</Alert.Title>
                        <Alert.Description className="mb-2">
                            The feature creates a comparison from a set of papers. E.g., uploading 5 papers results in a comparison with 5 columns.
                        </Alert.Description>
                        <Alert.Title>We don't store your PDFs</Alert.Title>
                        <Alert.Description>
                            The files are processed on our servers only to extract metadata and are not retained afterwards.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>

                {files.length > 0 && (
                    <ul className="list-none p-0! m-0! mb-3!">
                        {files.map((entry) => (
                            <li key={entry.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                                <Button
                                    isIconOnly
                                    variant="danger-soft"
                                    onPress={() => removeFile(entry.id)}
                                    aria-label={`Remove ${entry.file.name}`}
                                    isDisabled={isUploading}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                                <span className="flex-1 truncate">{entry.file.name}</span>
                                <span>{formatBytes(entry.file.size)}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {isOverLimit && (
                    <Alert status="danger" className="mb-3">
                        <Alert.Content>
                            <Alert.Description>
                                The selected files total {formatBytes(totalBytes)}, which exceeds the {formatBytes(MAX_TOTAL_UPLOAD_BYTES)} limit.
                                Remove some files to continue.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                )}

                <div className="flex justify-center mt-5">
                    <DragUploadPdf onDrop={handleDrop} isLoading={false} multiple />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="ghost" onPress={handleClose} isDisabled={isUploading}>
                    Cancel
                </Button>
                <Button variant="primary" isDisabled={files.length === 0 || isUploading || isOverLimit} onPress={handleSubmit}>
                    Get started
                </Button>
            </Modal.Footer>
        </ModalWithLoading>
    );
};

export default AiComparisonCreatorModal;
