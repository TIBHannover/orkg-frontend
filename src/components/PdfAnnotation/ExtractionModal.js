import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';
import ExtractReferencesModal from './ExtractReferencesModal';
import Confirm from 'reactstrap-confirm';
import { setTableData } from '../../actions/pdfAnnotation';
import { toast } from 'react-toastify';
import { readString } from 'react-papaparse';
import { useSelector, useDispatch } from 'react-redux';

const ExtractionModal = props => {
    const [loading, setLoading] = useState(false);
    const [extractReferencesModalOpen, setExtractReferencesModalOpen] = useState(false);
    const [importData, setImportData] = useState(null);
    const editorRef = React.createRef();
    const dispatch = useDispatch();
    const pdf = useSelector(state => state.pdfAnnotation.pdf);
    const tableData = useSelector(state => state.pdfAnnotation.tableData[props.id]);
    const extractionSuccessful = tableData && tableData.length > 0;

    useEffect(() => {
        // only extract the table if it hasn't been extracted yet
        if (tableData) {
            return;
        }

        const csvTableToObject = csv => {
            const fullData = readString(csv.join('\n'), {})['data'];

            dispatch(setTableData(props.id, fullData));
        };

        setLoading(true);

        const { x, y, w, h } = props.region;

        const form = new FormData();
        form.append('pdf', pdf);
        form.append('region', pxToPoint(y) + ',' + pxToPoint(x) + ',' + pxToPoint(y + h) + ',' + pxToPoint(x + w));
        form.append('pageNumber', props.pageNumber);

        fetch('http://localhost:9000/extractTable', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    console.log('err');
                } else {
                    return response.json();
                }
            })
            .then(function(data) {
                csvTableToObject(data);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
            });
    }, [props.region, props.pageNumber, props.id, pdf, dispatch, tableData]);

    const pxToPoint = x => (x * 72) / 96;

    const handleCsvDownload = () => {
        if (editorRef.current) {
            const exportPlugin = editorRef.current.hotInstance.getPlugin('exportFile');

            exportPlugin.downloadFile('csv', {
                bom: false,
                columnDelimiter: ',',
                columnHeaders: false,
                exportHiddenColumns: true,
                exportHiddenRows: true,
                fileExtension: 'csv',
                filename: 'extracted_table',
                mimeType: 'text/csv',
                rowDelimiter: '\r\n'
            });
        }
    };

    const toggleExtractReferencesModal = () => {
        setExtractReferencesModalOpen(!extractReferencesModalOpen);
    };

    /*const confirmClose = async () => {
        // only show the warning if the papers aren't imported yet
        if (!importData) {
            const confirm = await Confirm({
                title: 'Are you sure?',
                message: 'The changes you made will be lost after closing this popup',
                cancelColor: 'light'
            });

            if (confirm) {
                props.toggle();
            }
        } else {
            props.toggle();
        }
    };*/

    const handleImportData = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'For each row in the table, a new paper is added to the ORKG directly. Do you want to start the import right now? ',
            cancelColor: 'light'
        });

        if (confirm) {
            if (!editorRef.current) {
                return;
            }

            const exportPlugin = editorRef.current.hotInstance.getPlugin('exportFile');

            const csv = exportPlugin.exportAsBlob('csv', {
                bom: false,
                columnDelimiter: ',',
                columnHeaders: false,
                exportHiddenColumns: true,
                exportHiddenRows: true,
                rowDelimiter: '\r\n'
            });

            setLoading(true);

            const form = new FormData();
            form.append('csv', csv);

            fetch('http://localhost:9000/importCsv', {
                method: 'POST',
                body: form
            })
                .then(response => {
                    if (!response.ok) {
                        console.log('err');
                    } else {
                        return response.json();
                    }
                })
                .then(function(importData) {
                    setLoading(false);
                    setImportData(importData);

                    toast.success(`Successfully imported papers into the ORKG`);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

    return (
        <>
            <Modal isOpen={props.isOpen} toggle={props.toggle} style={{ maxWidth: '95%' }}>
                <ModalHeader toggle={props.toggle}>Table extraction</ModalHeader>

                {loading && (
                    <ModalBody>
                        <div className="text-center" style={{ fontSize: 40 }}>
                            <Icon icon={faSpinner} spin />
                        </div>
                    </ModalBody>
                )}

                {!loading && !importData && (
                    <>
                        <ModalBody>
                            {extractionSuccessful && (
                                <>
                                    <TableEditor setRef={editorRef} id={props.id} />
                                    <div className="mt-3">
                                        <Button size="sm" color="darkblue" onClick={toggleExtractReferencesModal}>
                                            Extract references
                                        </Button>{' '}
                                        <Button size="sm" color="darkblue" onClick={handleCsvDownload}>
                                            Download CSV
                                        </Button>
                                    </div>
                                </>
                            )}

                            {!extractionSuccessful && (
                                <Alert color="danger" fade={false}>
                                    No table found in the specified region. Please select a different region
                                </Alert>
                            )}
                        </ModalBody>

                        {extractionSuccessful && (
                            <ModalFooter>
                                <Button color="primary" onClick={handleImportData}>
                                    Import data
                                </Button>
                            </ModalFooter>
                        )}
                    </>
                )}

                {importData && (
                    <ModalBody>
                        Import results:{' '}
                        <ul>
                            {importData.map((result, i) => (
                                <li key={i}>{result}</li>
                            ))}
                        </ul>
                    </ModalBody>
                )}
            </Modal>

            <ExtractReferencesModal isOpen={extractReferencesModalOpen} toggle={toggleExtractReferencesModal} id={props.id} />
        </>
    );
};

ExtractionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    pageNumber: PropTypes.number.isRequired,
    pdf: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    region: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired
    })
};

export default ExtractionModal;
