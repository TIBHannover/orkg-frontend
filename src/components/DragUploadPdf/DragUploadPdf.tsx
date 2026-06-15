import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from '@heroui/react';
import { useState } from 'react';
import { type FileRejection, useDropzone } from 'react-dropzone';
import styled from 'styled-components';

const DragPdf = styled.div`
    width: 300px;
    text-align: center;
    border: 4px dashed #bbbdc0;
    padding: 40px 20px;
    border-radius: 15px;
    font-weight: 500;
    color: #a4a0a0;
    transition:
        border-color 0.2s,
        color 0.2s;
    outline: 0;

    &:not(.loading) {
        cursor: pointer;

        &:hover,
        &:focus,
        &.active {
            border-color: #8d8f91;
            color: #636363;
        }
    }
`;

const FilePlaceholder = styled(FontAwesomeIcon)`
    margin-bottom: 15px;
    color: inherit;
`;

type DragUploadPdfProps = {
    onDrop: (files: File[]) => void;
    pdf?: File | null;
    isLoading?: boolean;
    multiple?: boolean;
};

const DragUploadPdf = ({ pdf = null, onDrop: _onDrop, isLoading: controlledIsLoading, multiple = false }: DragUploadPdfProps) => {
    const [internalIsLoading, setInternalIsLoading] = useState(false);
    const isControlled = controlledIsLoading !== undefined;
    const isLoading = isControlled ? controlledIsLoading : internalIsLoading;

    const onDrop = (files: File[]) => {
        _onDrop(files);
        if (!isControlled) {
            setInternalIsLoading(true);
        }
    };

    const onDropRejected = (_fileRejections: FileRejection[]) => {
        toast.danger('Error uploading your file, only PDF files are accepted');
        if (!isControlled) {
            setInternalIsLoading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: { 'application/pdf': ['.pdf'] },
        multiple,
    });

    return (
        <>
            {!isLoading && !pdf && (
                <DragPdf {...getRootProps()} className={isDragActive ? 'active' : undefined}>
                    <FilePlaceholder icon={faFile} style={{ fontSize: 70 }} /> <br />
                    Drag 'n' drop a PDF file here, or click here to upload one
                    <input {...getInputProps()} />
                </DragPdf>
            )}

            {isLoading && (
                <DragPdf className="loading">
                    <FilePlaceholder spin icon={faSpinner} style={{ fontSize: 70 }} /> <br />
                    Parsing your PDF...
                </DragPdf>
            )}
        </>
    );
};

export default DragUploadPdf;
