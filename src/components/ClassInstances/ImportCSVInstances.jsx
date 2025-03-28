import PropTypes from 'prop-types';
import { useState } from 'react';
import { useCSVReader } from 'react-papaparse';
import { toast } from 'react-toastify';
import { Button, InputGroup, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import { PREDICATES } from '@/constants/graphSettings';
import { createLiteral } from '@/services/backend/literals';
import { createResource } from '@/services/backend/resources';
import { createLiteralStatement } from '@/services/backend/statements';

export default function ImportCSVInstances(props) {
    const [data, setData] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const { CSVReader } = useCSVReader();

    const handleOnFileLoad = ({ _data }) => {
        // Check the csv file
        if (!_data || _data.length === 0 || _data[0].length !== 2 || _data[0][0].toLowerCase() !== 'label' || _data[0][1].toLowerCase() !== 'uri') {
            toast.error('Please upload a CSV file that has only two columns: Label and URI');
            setData([]);
        } else {
            setData(_data);
        }
    };

    const PARSER_OPTIONS = {
        header: false,
        skipEmptyLines: true,
    };

    const handleImport = () => {
        if (data.length >= 2) {
            setIsImporting(true);
            const dataCalls = data.slice(1).map((r) => createResource(r[0], [props.classId]));
            Promise.all(dataCalls)
                .then((instances) => {
                    const statements = instances.map((newResource, index) => {
                        if (data[index + 1][1]) {
                            // add statement for URI
                            return createLiteral(data[index + 1][1]).then((literal) =>
                                createLiteralStatement(newResource.id, PREDICATES.URL, literal.id),
                            );
                        }
                        return Promise.resolve();
                    });
                    Promise.all(statements).then(() => {
                        toast.success(`${data.length - 1} instances imported successfully`);
                        props.callBack(); // Basically to refresh the list of instances
                        setIsImporting(false);
                        setData([]);
                        props.toggle();
                    });
                })
                .catch(() => {
                    toast.error('Something went wrong when importing instances');
                    setIsImporting(false);
                    setData([]);
                });
        }
    };

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Import instances</ModalHeader>
            <ModalBody>
                Please import your CSV file that has two columns: <b>Label</b> and <b>URI</b> using the form below.
                <div className="mt-3">
                    <CSVReader
                        accept=".csv, text/csv"
                        config={PARSER_OPTIONS}
                        onUploadAccepted={(result) => handleOnFileLoad({ _data: result.data })}
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
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={props.toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleImport} disabled={Boolean(isImporting || !data || data.length === 0)}>
                    {!isImporting && <>Import {data.length > 2 ? ` ${data.length - 1} ` : ''} instances</>}
                    {isImporting && 'Importing ....'}
                </Button>{' '}
            </ModalFooter>
        </Modal>
    );
}

ImportCSVInstances.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    classId: PropTypes.string.isRequired,
    callBack: PropTypes.func.isRequired,
};
