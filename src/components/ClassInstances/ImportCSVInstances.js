import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { createResource } from 'network';
import CSVReader from 'react-csv-reader';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

export default function ImportCSVInstances(props) {
    const [data, setData] = useState([]);
    const [error, seError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleOnFileLoad = data => {
        // Check the csv file
        if (data[0][0] === 'label' || data[0][1] === 'uri' || data[0].length > 2) {
            toast.error('Please Upload a CSV file that has only two columns : Label and URI');
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
            setLoading(true);
            const dataCalls = data.slice(1).map(r => createResource(r[0], [props.classId]));
            Promise.all(dataCalls)
                .then(instances => {
                    setLoading(false);
                })
                .catch(e => {
                    setLoading(false);
                });
        }
    };

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Import instances</ModalHeader>
            <ModalBody>
                Please import your csv file that has two columns : <b>Label</b> and <b>URI</b> using the form bellow.
                <div className="mt-3">
                    <CSVReader
                        cssClass="csv-reader-input"
                        label="Select CSV"
                        onFileLoaded={handleOnFileLoad}
                        onError={handleOnError}
                        inputId="ObiWan"
                        parserOptions={csvReaderOptions}
                        inputStyle={{ marginLeft: '5px' }}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleImport} disabled={Boolean(loading || !data || data.length === 0 || error)}>
                    {!loading && <>Import {data.length > 2 ? ` ${data.length - 1} ` : ''} instances</>}
                    {loading && 'Importing ....'}
                </Button>{' '}
                <Button color="secondary" onClick={props.toggle}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

ImportCSVInstances.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    classId: PropTypes.string.isRequired
};
