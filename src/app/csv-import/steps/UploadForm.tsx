'use client';

import { Alert, Button, cn, Form, Label, toast } from '@heroui/react';
import Link from 'next/link';
import Papa from 'papaparse';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const introLinkClass = cn('font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary');

type UploadFormProps = {
    handleOnFileLoaded: (data: { _data: string[][] }) => void;
};

const UploadForm = ({ handleOnFileLoaded }: UploadFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const onDropRejected = () => {
        toast.danger('Error uploading your file, only CSV (.csv) files are accepted');
        setIsLoading(false);
    };

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        setIsLoading(true);
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = (event) => {
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

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, onDropRejected, accept: { 'text/csv': ['.csv'] } });

    return (
        <div>
            <Alert status="accent" role="alert" className="mb-6">
                <Alert.Indicator className="self-start pt-0.5" />
                <Alert.Content className="min-w-0">
                    <Alert.Title>Import papers from a CSV file</Alert.Title>
                    <Alert.Description className="text-pretty text-sm leading-relaxed">
                        Make sure to have a look at the{' '}
                        <a
                            href="https://www.orkg.org/help-center/article/16/Import_CSV_files_in_ORKG"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={introLinkClass}
                        >
                            help guide
                        </a>{' '}
                        for formatting instructions. To easily find or create entity IDs for your CSV file, use the{' '}
                        <Link href={reverse(ROUTES.CSV_IMPORT_LOOKUP)} target="_blank" rel="noopener noreferrer" className={introLinkClass}>
                            Entity lookup tool
                        </Link>
                        .
                    </Alert.Description>
                </Alert.Content>
            </Alert>
            <Form>
                <div className="mb-3 w-full">
                    <Label htmlFor="select-csv-file" className="mb-1 block">
                        Select CSV file
                    </Label>
                    <div className="flex items-stretch min-h-9">
                        <Button onPress={open} isDisabled={isLoading} size="sm" variant="secondary" className="!h-9 !rounded-e-none">
                            {isLoading ? 'Loading...' : 'Browse file'}
                        </Button>
                        <input {...getInputProps({ id: 'select-csv-file' })} data-testid="csv-file-input" />
                        <div
                            {...getRootProps()}
                            className={cn(
                                'flex-1 min-w-0 flex items-center px-3 text-sm bg-background border border-border rounded-e-[var(--radius)] -ms-px',
                                isDragActive ? 'border-dashed' : 'border-solid',
                            )}
                        >
                            {!isDragActive && !isLoading && uploadedFile && uploadedFile.name}
                            {!isDragActive && !isLoading && !uploadedFile && 'No file is selected'}
                            {isLoading && 'Loading...'}
                            {isDragActive && 'Drop file here'}
                        </div>
                    </div>
                </div>
            </Form>
        </div>
    );
};
export default UploadForm;
