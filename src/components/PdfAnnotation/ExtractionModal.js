import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';
import ExtractReferencesModal from './ExtractReferencesModal';
import Confirm from 'reactstrap-confirm';
import { setTableData } from '../../actions/pdfAnnotation';
import { toast } from 'react-toastify';

class ExtractionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            ExtractReferencesModalOpen: false,
            importData: null
        };

        this.editorRef = React.createRef();
    }

    componentDidMount() {
        this.setState({
            loading: true
        });

        const { x, y, w, h } = this.props.region;

        const form = new FormData();
        form.append('pdf', this.props.pdf);
        form.append('region', this.pxToPoint(y) + ',' + this.pxToPoint(x) + ',' + this.pxToPoint(y + h) + ',' + this.pxToPoint(x + w));
        form.append('pageNumber', this.props.pageNumber);

        const self = this;

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
                self.csvTableToObject(data);
                self.setState({
                    loading: false
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    csvTableToObject = csv => {
        const columns = csv[0].split(','); //.map(field => field);
        const data = [];

        for (const [index, row] of csv.entries()) {
            if (index === 0) {
                continue;
            }

            const cells = row.split(',');
            const dataRow = [];

            if (cells.length > 0) {
                for (const [index, cell] of cells.entries()) {
                    dataRow.push(cell);
                }
            }
            data.push(dataRow);
        }

        if (columns.length === 0) {
            return;
        }

        console.log('fullData', fullData);

        const fullData = [columns, ...data];

        this.props.setTableData(fullData);
    };

    pxToPoint = x => (x * 72) / 96;

    handleCsvDownload = () => {
        if (this.editorRef.current) {
            const exportPlugin = this.editorRef.current.hotInstance.getPlugin('exportFile');

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

    toggleExtractReferencesModal = () => {
        this.setState(prevState => ({
            ExtractReferencesModalOpen: !prevState.ExtractReferencesModalOpen
        }));
    };

    confirmClose = async () => {
        // only show the warning if the papers aren't imported yet
        if (!this.state.importData) {
            const confirm = await Confirm({
                title: 'Are you sure?',
                message: 'The changes you made will be lost after closing this popup',
                cancelColor: 'light'
            });

            if (confirm) {
                this.props.toggle();
            }
        } else {
            this.props.toggle();
        }
    };

    handleImportData = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'For each row in the table, a new paper is added to the ORKG directly. Do you want to start the import right now? ',
            cancelColor: 'light'
        });

        if (confirm) {
            if (!this.editorRef.current) {
                return;
            }

            const exportPlugin = this.editorRef.current.hotInstance.getPlugin('exportFile');

            const csv = exportPlugin.exportAsBlob('csv', {
                bom: false,
                columnDelimiter: ',',
                columnHeaders: false,
                exportHiddenColumns: true,
                exportHiddenRows: true,
                rowDelimiter: '\r\n'
            });

            this.setState({
                loading: true
            });
            const self = this;

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
                    self.setState({
                        importData,
                        loading: false
                    });
                    toast.success(`Successfully imported papers into the ORKG`);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

    render() {
        return (
            <>
                <Modal isOpen={this.props.isOpen} toggle={this.confirmClose} style={{ maxWidth: '95%' }}>
                    <ModalHeader toggle={this.confirmClose}>Table extraction</ModalHeader>

                    {this.state.loading && (
                        <ModalBody>
                            <div className="text-center" style={{ fontSize: 40 }}>
                                <Icon icon={faSpinner} spin />
                            </div>
                        </ModalBody>
                    )}

                    {!this.state.loading && !this.state.importData && (
                        <>
                            <ModalBody>
                                {this.props.tableData && <TableEditor setRef={this.editorRef} />}
                                <div className="mt-3">
                                    <Button size="sm" color="darkblue" onClick={this.toggleExtractReferencesModal}>
                                        Extract references
                                    </Button>{' '}
                                    <Button size="sm" color="darkblue" onClick={this.handleCsvDownload}>
                                        Download CSV
                                    </Button>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <Button color="primary" onClick={this.handleImportData}>
                                    Import data
                                </Button>
                            </ModalFooter>
                        </>
                    )}

                    {this.state.importData && (
                        <ModalBody>
                            Import results:{' '}
                            <ul>
                                {this.state.importData.map((result, i) => (
                                    <li key={i}>{result}</li>
                                ))}
                            </ul>
                        </ModalBody>
                    )}
                </Modal>

                <ExtractReferencesModal isOpen={this.state.ExtractReferencesModalOpen} toggle={this.toggleExtractReferencesModal} />
            </>
        );
    }
}

ExtractionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    pageNumber: PropTypes.number.isRequired,
    pdf: PropTypes.object.isRequired,
    region: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired
    })
};

const mapStateToProps = state => ({
    pdf: state.pdfAnnotation.pdf,
    tableData: state.pdfAnnotation.tableData
});

const mapDispatchToProps = dispatch => ({
    setTableData: payload => dispatch(setTableData(payload))
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExtractionModal);
