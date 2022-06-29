import { useState, useEffect } from 'react';
import { Alert, Button, Form, FormGroup, Label, Table } from 'reactstrap';
import ConfirmBulkImport from 'components/ConfirmBulkImport/ConfirmBulkImport';
import CsvReader from 'react-csv-reader';
import styled from 'styled-components';
import StepContainer from 'components/StepContainer';
import Tippy from '@tippyjs/react';
import checkDataValidation from 'components/ConfirmBulkImport/CSVSchema';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const TableContainerStyled = styled.div`
    overflow: auto;
    background: ${props => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
`;

const PARSER_OPTIONS = {
    delimiter: ',',
    skipEmptyLines: true,
};

const CsvImport = () => {
    const [data, setData] = useState([]);
    const [, setFileName] = useState(null);
    const [error, setError] = useState(null);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const handleOnFileLoaded = (_data, fileInfo) => {
        setData(_data.map(r => r.map(s => (s ? s.trim() : ''))));
        setIsFinished(false);
        setFileName(fileInfo.name);
        validateCsv(_data);
    };

    useEffect(() => {
        document.title = 'CSV import - ORKG';
    }, []);

    const validateCsv = _data => {
        const validations = checkDataValidation(_data);
        return setError(validations);
    };

    const title = (
        <>
            CSV import
            <Tippy content="Open help center">
                <span className="ms-3">
                    <a href="https://www.orkg.org/help-center/article/16/Import_CSV_files_in_ORKG" target="_blank" rel="noopener noreferrer">
                        <Icon icon={faQuestionCircle} style={{ fontSize: 22, lineHeight: 1, marginTop: -4 }} className="text-secondary p-0" />
                    </a>
                </span>
            </Tippy>
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
                            <CsvReader
                                inputId="select-csv-file"
                                cssClass="csv-reader-input"
                                cssInputClass="form-control"
                                onFileLoaded={handleOnFileLoaded}
                                parserOptions={PARSER_OPTIONS}
                                inputStyle={{ marginLeft: '5px' }}
                            />
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
                                            {row.map((value, i) => (
                                                <td key={i}>{value}</td>
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
                        toggle={() => setIsOpenConfirmModal(v => !v)}
                        onFinish={() => setIsFinished(true)}
                    />
                )}
            </StepContainer>
        </div>
    );
};

export default CsvImport;
