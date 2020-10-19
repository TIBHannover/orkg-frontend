import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { createLiteralStatement } from 'services/backend/statements';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import { PREDICATES } from 'constants/graphSettings';
import CSVReader from 'react-csv-reader';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

export default function ImportCSVInstances(props) {
    const [data, setData] = useState([]);
    const [error, seError] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleOnFileLoad = data => {
        // Check the csv file
        if (!data || data.length === 0 || data[0].length !== 2 || data[0][0].toLowerCase() !== 'label' || data[0][1].toLowerCase() !== 'uri') {
            toast.error('Please upload a CSV file that has only two columns: Label and URI');
            setData([]);
        } else {
            setData(data);
        }
    };

    const handleOnError = err => {
        seError(err);
    };

    const csvReaderOptions = {
        header: false,
        dynamicTyping: true,
        skipEmptyLines: true
    };

    const handleImport = () => {
        if (data.length >= 2) {
            setIsImporting(true);
            const dataCalls = data.slice(1).map(r => createResource(r[0], [props.classId]));
            Promise.all(dataCalls)
                .then(instances => {
                    const statements = instances.map((newResource, index) => {
                        if (data[index + 1][1]) {
                            // add statement for URI
                            return createLiteral(data[index + 1][1]).then(literal =>
                                createLiteralStatement(newResource.id, PREDICATES.URL, literal.id)
                            );
                        } else {
                            return Promise.resolve();
                        }
                    });
                    Promise.all(statements).then(() => {
                        toast.success(`${data.length - 1} instances imported successfully`);
                        props.callBack(); // Basically to refresh the list of instances
                        setIsImporting(false);
                        setData([]);
                    });
                })
                .catch(e => {
                    toast.error(`Something went wrong when importing instances`);
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
                        cssClass="csv-reader-input"
                        label="Select a CSV File"
                        onFileLoaded={handleOnFileLoad}
                        onError={handleOnError}
                        parserOptions={csvReaderOptions}
                        inputStyle={{ marginLeft: '5px' }}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={props.toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleImport} disabled={Boolean(isImporting || !data || data.length === 0 || error)}>
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
    callBack: PropTypes.func.isRequired
};
