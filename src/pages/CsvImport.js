import { useState, useEffect } from 'react';
import { Alert, Button, Form, FormGroup, Label, Table } from 'reactstrap';
import ConfirmBulkImport from 'components/ConfirmBulkImport/ConfirmBulkImport';
import CsvReader from 'react-csv-reader';
import styled from 'styled-components';
import StepContainer from 'components/StepContainer';
import HelpModal from 'components/CsvImport/HelpModal';
import Tippy from '@tippy.js/react';
import checkDataValidation from 'components/ConfirmBulkImport/CSVSchema';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

const TableContainerStyled = styled.div`
    overflow: auto;
    background: ${props => props.theme.ultraLightBlue};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.darkblue};
    border-radius: ${props => props.theme.borderRadius};
`;

const PARSER_OPTIONS = {
    delimiter: ',',
    skipEmptyLines: true
};

const CsvImport = () => {
    const [data, setData] = useState([]);
    const [fileName, setFileName] = useState(null);
    const [error, setError] = useState(null);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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
        for (const { context, error } of validations) {
            if (error) {
                setError(`<b>${context}</b>: ${error.message}`);
                return;
            }
        }
        return setError(null);
    };

    const title = (
        <>
            CSV import
            <Tippy content="Open help popup">
                <span className="ml-3">
                    <Button
                        color="link"
                        outline
                        size="sm"
                        style={{ fontSize: 22, lineHeight: 1, marginTop: -4 }}
                        className="p-0"
                        onClick={() => setIsHelpModalOpen(true)}
                    >
                        <Icon icon={faQuestionCircle} className="text-darkblue" />
                    </Button>
                </span>
            </Tippy>
        </>
    );

    return (
        <div>
            <StepContainer step="1" title={title} bottomLine active>
                <Alert color="info" fade={false}>
                    With this tool, you can import a CSV file with papers to the ORKG. Make sure to have a look at the{' '}
                    <Button color="link" onClick={() => setIsHelpModalOpen(true)} className="p-0 align-baseline">
                        help guide
                    </Button>{' '}
                    for formatting your CSV file
                </Alert>
                <Form>
                    <FormGroup>
                        <Label htmlFor="select-csv-file">Select CSV file</Label>
                        <div className="custom-file">
                            <CsvReader
                                cssClass="csv-reader-input"
                                cssInputClass="custom-file-input "
                                onFileLoaded={handleOnFileLoaded}
                                parserOptions={PARSER_OPTIONS}
                                inputStyle={{ marginLeft: '5px' }}
                            />
                            <label className="custom-file-label" htmlFor="exampleCustomFileBrowser">
                                {fileName ?? 'Select a file'}
                            </label>
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
                                        __html: error
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
            <HelpModal isOpen={isHelpModalOpen} toggle={() => setIsHelpModalOpen(o => !o)} />
        </div>
    );
};

export default CsvImport;
