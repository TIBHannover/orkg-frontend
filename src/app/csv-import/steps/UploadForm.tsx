'use client';

import Papa from 'papaparse';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Alert, Button, Form, FormGroup, InputGroup, Label } from 'reactstrap';

type UploadFormProps = {
    handleOnFileLoaded: (data: { _data: string[][] }) => void;
};

const UploadForm = ({ handleOnFileLoaded }: UploadFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const onDropRejected = () => {
        toast.error('Error uploading your file, only CSV (.csv) files are accepted');
        setIsLoading(false);
    };

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        setIsLoading(true);
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            // Parse CSV file
            Papa.parse(event.target?.result as string, {
                header: false,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim(),
                transform: (value) => value.trim(),
                complete: (results) => {
                    handleOnFileLoaded({ _data: results.data as string[][] });
                },
            });
        };
        reader.readAsText(file);
        setUploadedFile(file);
        setIsLoading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, onDropRejected, accept: { 'text/csv': ['.csv'] } });
    const { ref, ...rest } = getRootProps();
    return (
        <div>
            <Alert color="info" fade={false}>
                With this tool, you can import a CSV file with papers to the ORKG. Make sure to have a look at the{' '}
                <a href="https://www.orkg.org/help-center/article/16/Import_CSV_files_in_ORKG" target="_blank" rel="noopener noreferrer">
                    help guide
                </a>{' '}
                for formatting your CSV file
            </Alert>
            <Form>
                <FormGroup>
                    <Label for="select-csv-file">Select CSV file</Label>
                    <div className="custom-file">
                        <InputGroup>
                            <Button {...rest} disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Browse file'}
                            </Button>
                            <input {...getInputProps()} data-testid="csv-file-input" />
                            <div
                                {...getRootProps()}
                                style={{
                                    border: `1px ${isDragActive ? 'dashed' : 'solid'} #dbdde5`,
                                    lineHeight: 2.2,
                                    paddingLeft: 10,
                                    flexGrow: '1',
                                }}
                            >
                                {!isDragActive && !isLoading && uploadedFile && uploadedFile.name}
                                {!isDragActive && !isLoading && !uploadedFile && 'No file is selected'}
                                {isLoading && 'Loading...'}
                                {isDragActive && 'Drop file here'}
                            </div>
                        </InputGroup>
                    </div>
                </FormGroup>
            </Form>
        </div>
    );
};
export default UploadForm;
