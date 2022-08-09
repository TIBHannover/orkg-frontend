import { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { useDropzone } from 'react-dropzone';
import { useSelector, useDispatch } from 'react-redux';
import { uploadPdf } from 'slices/pdfTextAnnotationSlice';
import { toast } from 'react-toastify';

const DragPdf = styled.div`
    margin: 20% auto 0;
    width: 300px;
    text-align: center;
    border: 4px dashed #bbbdc0;
    padding: 40px 20px;
    border-radius: 15px;
    font-weight: 500;
    color: #a4a0a0;
    transition: border-color 0.2s, color 0.2s;
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

const FilePlaceholder = styled(Icon)`
    margin-bottom: 15px;
    color: inherit;
`;

const DragUpload = () => {
    const pdf = useSelector(state => state.pdfTextAnnotation.pdf);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const onDrop = files => {
        dispatch(uploadPdf(files));
        setIsLoading(true);
    };

    const onDropRejected = () => {
        toast.error('Error uploading your file, only PDF files are accepted');
        setIsLoading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, onDropRejected, accept: { 'application/pdf': ['.pdf'] } });

    return (
        <>
            {!isLoading && !pdf && (
                <DragPdf {...getRootProps()} className={isDragActive && 'active'}>
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

export default DragUpload;
