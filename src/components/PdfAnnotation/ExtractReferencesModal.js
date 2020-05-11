import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Form, FormGroup, Label, Input } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';

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
        if (this.props.data !== prevProps.data) {
            this.getColumns();
        }
    }

    getColumns = () => {
        if (!this.props.data || this.props.data.length === 0) {
            return;
        }

        const columns = this.props.data[0].split(',');

        this.setState({
            columns
        });
    };

    handleSelectColumn = e => {
        this.setState({ selectedColumn: e.target.value });
    };

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Reference extraction</ModalHeader>
                <ModalBody>
                    <Alert color="info">References used within a table can be extracted. The extracted data will be added to the table</Alert>
                    <Form>
                        <FormGroup>
                            <Label for="exampleSelectMulti">Select the column that contains the reference key</Label>
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
                        <Button color="primary" onClick={() => this.props.handleExtractReferences(this.state.selectedColumn)}>
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
    pdf: state.pdfAnnotation.pdf
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExtractReferencesModal);
