'use client';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Accordion, Button, ListGroup } from 'reactstrap';
import styled from 'styled-components';

import TemplateCard from '@/components/Cards/TemplateCard/TemplateCard';
import Tooltip from '@/components/FloatingUI/Tooltip';
import StepContainer from '@/components/StepContainer';
import useImportSHACL from '@/components/Templates/ImportSHACL/hooks/useImportSHACL';
import ViewShapes from '@/components/Templates/ImportSHACL/ViewShapes';
import requireAuthentication from '@/requireAuthentication';

const DragRDF = styled.div`
    margin: 0 auto 0;
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

const FilePlaceholder = styled(FontAwesomeIcon)`
    margin-bottom: 15px;
    color: inherit;
`;

function ImportSHACL() {
    const [data, setData] = useState(null);
    const [importedTemplates, setImportedTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const { parseTemplates, importTemplates } = useImportSHACL();

    useEffect(() => {
        document.title = 'Import SHACL - ORKG';
    });

    const onDrop = async ([file]) => {
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            try {
                const parsed = await parseTemplates(content);
                setData(parsed);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
                toast.error(error.message);
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
        setUploadedFile(file);
    };

    const onDropRejected = () => {
        toast.error('Error uploading your file, only N-Triples (.n3) files are accepted');
        setIsLoading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, onDropRejected, accept: { 'text/n3': ['.n3'] } });

    const [open, setOpen] = useState('0');
    const toggle = (id) => {
        if (open === id) {
            setOpen();
        } else {
            setOpen(id);
        }
    };

    const activeImport = data?.some((nodesShape) => !nodesShape.targetClassHasAlreadyTemplate);
    return (
        <>
            <StepContainer
                active
                bottomLine
                step="1"
                title={
                    <>
                        Import SHACL
                        <Tooltip content="Open help center">
                            <span className="ms-3">
                                <a
                                    href="https://orkg.org/help-center/article/51/Import_SHACL_shapes_in_ORKG"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FontAwesomeIcon
                                        icon={faQuestionCircle}
                                        style={{ fontSize: 22, lineHeight: 1, marginTop: -4 }}
                                        className="text-secondary p-0"
                                    />
                                </a>
                            </span>
                        </Tooltip>
                    </>
                }
            >
                <>
                    {!isLoading && !data && (
                        <DragRDF {...getRootProps()} className={isDragActive && 'active'}>
                            <FilePlaceholder icon={faFile} style={{ fontSize: 70 }} /> <br />
                            Drag 'n' drop a N-Triples file here, or click here to upload one
                            <input {...getInputProps()} />
                        </DragRDF>
                    )}
                    {isLoading && (
                        <DragRDF className="loading">
                            <FilePlaceholder spin icon={faSpinner} style={{ fontSize: 70 }} /> <br />
                            Parsing your RDF...
                        </DragRDF>
                    )}
                    {!isLoading && data && uploadedFile && (
                        <div className="d-flex">
                            <div className="pt-1 flex-grow-1">
                                Filename: <b>{uploadedFile.name}</b>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    setData(null);
                                    setUploadedFile(null);
                                    setImportedTemplates([]);
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    )}
                </>
            </StepContainer>
            <StepContainer bottomLine step="2" topLine title="View shapes" active={data && data?.length > 0}>
                <Accordion open={open} toggle={toggle}>
                    <ViewShapes data={data} />
                </Accordion>

                <Button
                    disabled={!activeImport || isImporting || importedTemplates?.length > 0}
                    className="mt-3"
                    color="primary"
                    onClick={async () => {
                        setIsImporting(true);
                        try {
                            const result = await importTemplates(data);
                            setImportedTemplates(result);
                            setIsImporting(false);
                        } catch {
                            toast.error('Error while importing templates');
                            setIsImporting(false);
                        }
                    }}
                >
                    Import
                </Button>
            </StepContainer>
            <StepContainer
                step="3"
                title="Import templates"
                topLine
                active={data && data?.length > 0 && (isImporting || importedTemplates?.length > 0)}
            >
                {isImporting && 'Importing...'}
                {!isImporting && importedTemplates.length > 0 && (
                    <>
                        Imported templates:
                        <ListGroup className="mt-2 rounded">
                            {importedTemplates.map((template) => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
                        </ListGroup>
                    </>
                )}
            </StepContainer>
        </>
    );
}

export default requireAuthentication(ImportSHACL);
