import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest, predicatesUrl, resourcesUrl } from '../../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card, ListGroup, ListGroupItem, CardDeck, Modal, ModalHeader, ModalBody, ModalFooter, Collapse, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { range } from '../../../../utils';
import Tooltip from '../../../Utils/Tooltip';
import TagsInput from '../../../Utils/TagsInput';
import FormValidator from '../../../Utils/FormValidator';
import { getStatementsBySubject } from '../../../../network';
import styles from '../Contributions.module.scss';
import StatementItem from './StatementItem';
import AutoComplete from './AutoComplete';
import { connect } from 'react-redux';
import { createProperty } from '../../../../actions/addPaper';

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

    /*handleAddStatement = () => {
        this.handleHideAddStatement();
    }*/

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
                            {/*<Input bsSize="sm"
                            placeholder="Enter a predicate"
                            name="newPredicateValue"
                            value={this.state.newPredicateValue}
                            onChange={this.handleInputChange} />*/}

                            <AutoComplete requestUrl={predicatesUrl}
                                placeholder="Enter a property"
                                onItemSelected={this.handlePropertySelect}
                                onNewItemSelected={this.toggleConfirmNewProperty}
                                onKeyUp={() => { }}
                                disableBorderRadiusRight />

                            <InputGroupAddon addonType="append">
                                <Button color="light" className={styles.addStatementActionButton} onClick={this.handleHideAddStatement}>Cancel</Button>
                                {/*<Button color="light" className={styles.addStatementActionButton} onClick={this.handleAddStatement}>Done</Button>*/}
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

const mapStateToProps = state => {
    return {
        ...state.addPaper,
    }
};

const mapDispatchToProps = dispatch => ({
    createProperty: (data) => dispatch(createProperty(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddStatement);