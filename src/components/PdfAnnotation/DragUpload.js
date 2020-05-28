import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { parse } from 'node-html-parser';
import { setFile, setParsedPdfData } from '../../actions/pdfAnnotation';
import { useDispatch } from 'react-redux';
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
    const [loading, setLoading] = useState(false);
    const pdf = useSelector(state => state.pdfAnnotation.pdf);
    const dispatch = useDispatch();

    const onDrop = files => {
        setLoading(true);

        if (files.length === 0) {
            return;
        }

        const pdf = files[0];

        const form = new FormData();
        form.append('pdf', pdf);

        fetch('http://localhost:9000/convertPdf', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    toast.error(`An error has occurred during the parsing of your PDF file`);
                } else {
                    return response.text();
                }
            })
            .then(function(data) {
                const parseData = parse(data, {
                    style: true // retrieve content in <style> (hurts performance but required)
                });
                const pages = parseData.querySelectorAll('.pf');
                const styles = parseData.querySelectorAll('style');

                dispatch(
                    setFile({
                        pdf,
                        pages,
                        styles
                    })
                );

                parsePdf(pdf);
            })
            .catch(err => {
                console.log(err);
            });
    };

    const parsePdf = pdf => {
        const form = new FormData();
        form.append('input', pdf);

        fetch('http://localhost:8070/api/processFulltextDocument', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    console.log('err');
                } else {
                    return response.text();
                }
            })
            .then(str => new window.DOMParser().parseFromString(str, 'text/xml')) // parse the xml
            .then(function(data) {
                dispatch(setParsedPdfData(data));
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
            });
    };

    const onDropRejected = () => {
        toast.error(`Error uploading your file, only PDF files are accepted`);
        setLoading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, onDropRejected, accept: 'application/pdf' });

    return (
        <>
            {!loading && !pdf && (
                <DragPdf {...getRootProps()} className={isDragActive && 'active'}>
                    <FilePlaceholder icon={faFile} style={{ fontSize: 70 }} /> <br />
                    Drag 'n' drop a PDF file here, or click here to upload one
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
