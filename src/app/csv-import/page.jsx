'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useCSVReader } from 'react-papaparse';
import { Alert, Button, Form, FormGroup, InputGroup, Label, Table } from 'reactstrap';
import styled from 'styled-components';

import ConfirmBulkImport from '@/components/ConfirmBulkImport/ConfirmBulkImport';
import checkDataValidation from '@/components/ConfirmBulkImport/CSVSchema';
import Tooltip from '@/components/FloatingUI/Tooltip';
import StepContainer from '@/components/StepContainer';

const TableContainerStyled = styled.div`
    overflow: auto;
    background: ${(props) => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${(props) => props.theme.secondary};
    border-radius: ${(props) => props.theme.borderRadius};
`;

const PARSER_OPTIONS = {
    delimiter: ',',
    skipEmptyLines: true,
};

const CsvImport = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const { CSVReader } = useCSVReader();

    const validateCsv = (_data) => {
        const validations = checkDataValidation(_data);
        return setError(validations);
    };

    const handleOnFileLoaded = ({ _data }) => {
        setData(_data.map((r) => r.map((s) => (s ? s.trim() : ''))));
        setIsFinished(false);
        validateCsv(_data);
    };

    useEffect(() => {
        document.title = 'CSV import - ORKG';
    }, []);

    const title = (
        <>
            CSV import
            <Tooltip content="Open help center">
                <span className="ms-3">
                    <a href="https://www.orkg.org/help-center/article/16/Import_CSV_files_in_ORKG" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon
                            icon={faQuestionCircle}
                            style={{ fontSize: 22, lineHeight: 1, marginTop: -4 }}
                            className="text-secondary p-0"
                        />
                    </a>
                </span>
            </Tooltip>
        </>
    );

    return (
        <div>
            <StepContainer step="1" title={title} bottomLine active>
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
                            <CSVReader
                                accept=".csv, text/csv"
                                config={PARSER_OPTIONS}
                                onUploadAccepted={(result) => handleOnFileLoaded({ _data: result.data })}
                            >
                                {({ getRootProps, acceptedFile, ProgressBar }) => (
                                    <>
                                        <InputGroup>
                                            <Button {...getRootProps()}>Browse file</Button>
                                            <div
                                                {...getRootProps()}
                                                style={{
                                                    border: '1px solid #ccc',
                                                    lineHeight: 2.2,
                                                    paddingLeft: 10,
                                                    flexGrow: '1',
                                                }}
                                            >
                                                {acceptedFile && acceptedFile.name}
                                                {!acceptedFile && 'No file is selected'}
                                            </div>
                                        </InputGroup>
                                        <ProgressBar style={{ backgroundColor: '#dbdde5' }} />
                                    </>
                                )}
                            </CSVReader>
                        </div>
                    </FormGroup>
                </Form>
            </StepContainer>
            <StepContainer step="2" title="View file" topLine bottomLine active={data && data.length > 0}>
                {data && data.length > 0 && (
                    <>
                        {error ? (
                            <Alert color="danger" className="mt-3">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: error,
                                    }}
                                />
                            </Alert>
                        ) : (
                            <Alert color="success" className="mt-3">
                                No formatting errors were found
                            </Alert>
                        )}

                        <TableContainerStyled>
                            <Table size="sm" bordered hover className="m-0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        {data[0].map((value, i) => (
                                            <th key={i}>{value}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(1).map((row, i) => (
                                        <tr key={i}>
                                            <th scope="row">{i + 1}</th>
                                            {row.map((value, j) => (
                                                <td key={j}>{value}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableContainerStyled>
                    </>
                )}
            </StepContainer>

            <StepContainer step="3" title="Import papers" topLine active={data.length > 0 && !error}>
                {!isFinished ? (
                    <Button color="primary" onClick={() => setIsOpenConfirmModal(true)}>
                        Preview & import
                    </Button>
                ) : (
                    <Button color="primary" disabled>
                        Import finished
                    </Button>
                )}

                {isOpenConfirmModal && (
                    <ConfirmBulkImport
                        data={data}
                        isOpen={isOpenConfirmModal}
                        toggle={() => setIsOpenConfirmModal((v) => !v)}
                        onFinish={() => setIsFinished(true)}
                    />
                )}
            </StepContainer>
        </div>
    );
};

export default CsvImport;
