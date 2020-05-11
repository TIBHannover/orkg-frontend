import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';
import ExtractReferencesModal from './ExtractReferencesModal';
class ExtractionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            extractedTable: null,
            loading: false,
            ExtractReferencesModalOpen: false
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
                self.setState({
                    extractedTable: data,
                    loading: false
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

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

    handleExtractReferences = referenceKeyColumn => {
        console.log('referenceKeyColumn', referenceKeyColumn);

        // TODO: response to store, and only perform this action if the response isn't in the store
        const form = new FormData();
        form.append('input', this.props.pdf);

        fetch('http://localhost:8070/api/processFulltextDocument', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    console.log('err');
                } else {
                    return response.text();
                }
            })
            .then(str => new window.DOMParser().parseFromString(str, 'text/xml')) // parse the xml
            .then(function(data) {
                console.log('data', data);
                console.log('data', data.querySelectorAll('ref[type="bibr"]'));
            })
            .catch(err => {
                console.log(err);
            });

        // for each cell of the selected column
        // see if numeric,
        //if so select from the text body
        // if not numeric:
        //generate keys from the reference list (this can be done beforehand)
        // match against the key in the cell
        // if if the respective metadata columns already exist, if not: add them
        // insert the data that has been captured
    };

    toggleExtractReferencesModal = () => {
        this.setState(prevState => ({
            ExtractReferencesModalOpen: !prevState.ExtractReferencesModalOpen
        }));
    };

    render() {
        return (
            <>
                <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size="lg">
                    <ModalHeader toggle={this.props.toggle}>Table extraction</ModalHeader>
                    <ModalBody>
                        {!this.state.loading && this.state.extractedTable && <TableEditor data={this.state.extractedTable} setRef={this.editorRef} />}
                        {this.state.loading && (
                            <div className="text-center" style={{ fontSize: 40 }}>
                                <Icon icon={faSpinner} spin />
                            </div>
                        )}

                        {!this.state.loading && (
                            <div className="mt-3">
                                <Button size="sm" color="darkblue" onClick={this.toggleExtractReferencesModal}>
                                    Extract references
                                </Button>{' '}
                                <Button size="sm" color="darkblue" onClick={this.handleCsvDownload}>
                                    Download CSV
                                </Button>
                            </div>
                        )}
                    </ModalBody>

                    <ModalFooter>{!this.state.loading && <Button color="primary">Import data</Button>}</ModalFooter>
                </Modal>

                <ExtractReferencesModal
                    isOpen={this.state.ExtractReferencesModalOpen}
                    toggle={this.toggleExtractReferencesModal}
                    handleExtractReferences={this.handleExtractReferences}
                    data={this.state.extractedTable}
                />
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
    pdf: state.pdfAnnotation.pdf
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExtractionModal);
