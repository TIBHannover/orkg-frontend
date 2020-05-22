import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';
import { isNumber } from 'lodash';
import { updateTableData } from '../../actions/pdfAnnotation';
import { toast } from 'react-toastify';

class ExtractReferencesModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [],
            selectedColumn: ''
        };
    }

    componentDidMount() {
        this.getColumns();
    }

    componentDidUpdate(prevProps) {
        if (this.props.tableData !== prevProps.tableData) {
            this.getColumns();
        }
    }

    getColumns = () => {
        if (!this.props.tableData || this.props.tableData.length === 0) {
            return;
        }

        const columns = this.props.tableData[0];

        this.setState({
            columns,
            selectedColumn: columns[0] // select the first element
        });
    };

    handleSelectColumn = e => {
        this.setState({ selectedColumn: e.target.value });
    };

    handleExtractReferences = () => {
        const { selectedColumn } = this.state;
        const { tableData } = this.props;

        const citationKeyToInternalId = this.citationKeyToInternalId();
        const allReferences = this.getAllReferences();
        const tableHead = tableData[0];
        const tableBody = tableData.slice(1);
        const columnIndex = tableHead.indexOf(selectedColumn);
        const paperColumns = [
            'paper:title',
            'paper:authors',
            'paper:publication_month',
            'paper:publication_year',
            //'paper:research_field',
            //'contribution:research_problem',
            'paper:doi'
        ];
        let paperColumnsIndex = {};

        for (const column of paperColumns) {
            if (tableHead.indexOf(column) === -1) {
                this.props.updateTableData([[0, tableHead.length, null, column]]);
                paperColumnsIndex[column] = tableHead.length - 1;
            } else {
                paperColumnsIndex[column] = tableHead.indexOf(column);
            }
        }

        let tableUpdates = [];
        let notFoundCount = 0;
        let foundCount = 0;
        for (const [index, row] of tableBody.entries()) {
            const value = row[columnIndex];
            const rowNumber = index + 1;

            const internalId = citationKeyToInternalId[value];

            // only continue if the citation has been found
            if (internalId) {
                const reference = allReferences[internalId];

                if (reference) {
                    foundCount++;
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:title'], null, reference['title']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:publication_month'], null, reference['publicationMonth']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:publication_year'], null, reference['publicationYear']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:doi'], null, reference['doi']]);
                    tableUpdates.push([rowNumber, paperColumnsIndex['paper:authors'], null, reference['authors'].join(';')]);
                }
            } else {
                notFoundCount++;
            }

            this.props.updateTableData(tableUpdates);
        }

        // close the modal
        this.props.toggle();
        if (foundCount > 0) {
            toast.success(`Successfully extracted ${foundCount} out of ${tableBody.length} references`);
        } else {
            toast.error('No references could be extracted automatically, please add them manually');
        }
    };

    // builds an object to convert citation keys used in the paper's text (e.g., [10]) and maps them to the internal IDs
    citationKeyToInternalId = () => {
        const references = this.props.parsedPdfData.querySelectorAll('ref[type="bibr"]');

        let mapping = {};

        for (const reference of references) {
            const internalId = reference.getAttribute('target');

            if (!internalId) {
                continue;
            }
            const internalIdClean = internalId.replace('#', '');
            const citationKey = reference.innerHTML;
            const citationKeyClean = citationKey.replace('[', '').replace(']', '');

            if (!isNaN(citationKeyClean)) {
                mapping[citationKeyClean] = internalIdClean;
            }
        }

        return mapping;
    };

    getAllReferences = () => {
        const references = this.props.parsedPdfData.querySelectorAll('back [type="references"] biblStruct');
        let referencesParsed = {};

        for (const reference of references) {
            const id = reference.getAttribute('xml:id');

            let title = '';
            let doi = '';
            let publicationMonth = '';
            let publicationYear = '';
            let authors = [];

            // title
            const _title = reference.querySelector('analytic title') || reference.querySelector('monogr title');
            if (_title) {
                title = _title.innerHTML;
            }

            // doi
            const _doi = reference.querySelector('idno[type="DOI"]');
            if (_doi) {
                doi = _doi.innerHTML;
            }

            // publication month & year
            const publishedDate = reference.querySelector('monogr imprint date[when]');
            if (publishedDate) {
                const parsedData = publishedDate.getAttribute('when').split('-');

                if (parsedData.length > 0) {
                    publicationYear = parseInt(parsedData[0]);
                }
                if (parsedData.length > 1) {
                    publicationMonth = parseInt(parsedData[1]);
                }
            }

            // authors
            authors = this.parseAuthors(reference);

            referencesParsed[id] = {
                title,
                doi,
                publicationMonth,
                publicationYear,
                authors
            };
        }

        return referencesParsed;
    };

    parseAuthors = reference => {
        const authors = reference.querySelectorAll('analytic author');

        let authorsParsed = [];

        for (const author of authors) {
            let firstName = '';
            let middleName = '';
            let lastName = '';

            const _firstName = author.querySelector('forename[type="first"]');
            if (_firstName) {
                firstName = _firstName.innerHTML + ' ';
            }

            const _middleName = author.querySelector('forename[type="middle"]');
            if (_middleName) {
                middleName = _middleName.innerHTML + ' ';
            }

            const _lastName = author.querySelector('surname');
            if (_lastName) {
                lastName = _lastName.innerHTML;
            }

            authorsParsed.push(firstName + middleName + lastName);
        }

        return authorsParsed;
    };

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Reference extraction</ModalHeader>
                <ModalBody>
                    <Alert color="info">References used within a table can be extracted. The extracted data will be added to the table</Alert>
                    <Form>
                        <FormGroup>
                            <Label for="exampleSelectMulti">Select the column that contains the citation key</Label>
                            <Input type="select" value={this.state.selectedColumn} onChange={this.handleSelectColumn}>
                                {this.state.columns.map(column => (
                                    <option>{column}</option>
                                ))}
                            </Input>
                        </FormGroup>
                    </Form>
                </ModalBody>

                <ModalFooter>
                    {!this.state.loading && (
                        <Button color="primary" onClick={this.handleExtractReferences}>
                            Extract references
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        );
    }
}

ExtractReferencesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    pdf: state.pdfAnnotation.pdf,
    tableData: state.pdfAnnotation.tableData,
    parsedPdfData: state.pdfAnnotation.parsedPdfData
});

const mapDispatchToProps = dispatch => ({
    updateTableData: payload => dispatch(updateTableData(payload))
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExtractReferencesModal);
