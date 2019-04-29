import React, { Component } from 'react';
import { predicatesUrl } from '../../../../network';
import { InputGroup, InputGroupAddon, Button, ListGroupItem, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import styles from '../Contributions.module.scss';
import AutoComplete from './AutoComplete';
import { connect } from 'react-redux';
import { createProperty } from '../../../../actions/addPaper';
import PropTypes from 'prop-types';

// TODO: this is about adding a property, not really a statement. So rename this component?
class AddStatement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showAddStatement: false,
            newPredicateValue: '',
            confirmNewPropertyModal: false,
            newPropertyLabel: '',
        }
    }

    handleShowAddStatement = () => {
        this.setState({
            showAddStatement: true,
        });
    }

    handleHideAddStatement = () => {
        this.setState({
            showAddStatement: false,
            newPredicateValue: '',
        });
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    toggleConfirmNewProperty = (propertyLabel) => {
        this.setState(prevState => ({
            confirmNewPropertyModal: !prevState.confirmNewPropertyModal,
            propertyLabel
        }));
    }

    handlePropertySelect = ({ id, value: label }) => {
        this.setState({
            showAddStatement: false
        });

        this.props.createProperty({
            resourceId: this.props.selectedResource,
            existingPredicateId: id,
            label: label,
        });
    }

    handleNewProperty = () => {
        this.setState({
            showAddStatement: false
        });

        this.toggleConfirmNewProperty(); // hide dialog

        this.props.createProperty({
            resourceId: this.props.selectedResource,
            label: this.state.propertyLabel,
        });
    }

    render() {
        return (
            <>
                <ListGroupItem className={`${styles.statementItem} ${styles.statementItemInput}`}>
                    {this.state.showAddStatement ?
                        <InputGroup className={`${styles.addStatement}`}>
                            <AutoComplete 
                                requestUrl={predicatesUrl}
                                placeholder="Enter a property"
                                onItemSelected={this.handlePropertySelect}
                                onNewItemSelected={this.toggleConfirmNewProperty}
                                onKeyUp={() => { }}
                                disableBorderRadiusRight 
                            />

                            <InputGroupAddon addonType="append">
                                <Button color="light" className={styles.addStatementActionButton} onClick={this.handleHideAddStatement}>Cancel</Button>
                            </InputGroupAddon>

                        </InputGroup>
                        :
                        <span className="btn btn-link p-0 border-0 align-baseline" onClick={this.handleShowAddStatement}>
                            + Add property
                        </span>
                    }
                </ListGroupItem>

                <Modal isOpen={this.state.confirmNewPropertyModal} toggle={this.toggleConfirmNewProperty}>
                    <ModalHeader toggle={this.toggleConfirmNewProperty}>Are you sure you need a new property?</ModalHeader>
                    <ModalBody>
                        Often there are existing properties that you can use as well. It is better to use existing properties then new ones.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={this.toggleConfirmNewProperty}>Cancel</Button>{' '}
                        <Button color="primary" onClick={this.handleNewProperty}>Create new property</Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

AddStatement.propTypes = {
    createProperty: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
    return {
        selectedResource: state.addPaper.selectedResource,
    }
};

const mapDispatchToProps = dispatch => ({
    createProperty: (data) => dispatch(createProperty(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddStatement);