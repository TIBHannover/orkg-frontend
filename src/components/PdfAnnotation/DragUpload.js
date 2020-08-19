import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { convertPdf, failedToConvertPdf } from 'actions/pdfAnnotation';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const DragPdf = styled.div`
    margin: 20% auto 0;
    width: 310px;
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
    const pdf = useSelector(state => state.pdfAnnotation.pdf);
    const pdfConvertIsFetching = useSelector(state => state.pdfAnnotation.pdfConvertIsFetching);
    const pdfParseIsFetching = useSelector(state => state.pdfAnnotation.pdfParseIsFetching);
    const dispatch = useDispatch();

    const onDrop = files => {
        dispatch(convertPdf({ files }));
    };

    const onDropRejected = () => {
        toast.error(`Error uploading your file, only PDF files are accepted`);
        dispatch(failedToConvertPdf());
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, onDropRejected, accept: 'application/pdf' });
    const loading = pdfConvertIsFetching || pdfParseIsFetching;

    return (
        <>
            {!loading && !pdf && (
                <DragPdf {...getRootProps()} className={isDragActive && 'active'}>
                    <FilePlaceholder icon={faFile} style={{ fontSize: 70 }} /> <br />
                    Drag 'n' drop a PDF file here, or click here to upload one. Uploaded files are not stored on our servers
                    <input {...getInputProps()} />
                </DragPdf>
            )}

            {loading && (
                <DragPdf className="loading">
                    <FilePlaceholder spin icon={faSpinner} style={{ fontSize: 70 }} /> <br />
                    Parsing your PDF...
                </DragPdf>
            )}
        </>
    );
};

export default DragUpload;
