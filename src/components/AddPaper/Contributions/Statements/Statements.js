import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card, ListGroup, ListGroupItem, CardDeck, Modal, ModalHeader, ModalBody, ModalFooter, Collapse, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from '../ProgressBar';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import TagsInput from '../../Utils/TagsInput';
import FormValidator from '../../Utils/FormValidator';
import { getStatementsBySubject } from '../../../network';
import styles from './Contributions.module.scss';

class Statements extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            collapse: false, //replace
            dropdownOpen: false, //replace
        }
    }

    toggleDeleteContribution = () => {
        this.setState(prevState => ({
            deleteContributionModal: !prevState.deleteContributionModal
        }));
    }

    toggle = () => {
        this.setState(state => ({ collapse: !state.collapse }));
    }

    toggleDropDown = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    render() {
        return (
            <ListGroup>
                <ListGroupItem active={true} onClick={this.toggle} className={`${styles.statementItem} ${styles.statementActive}`}>
                    Has results
                                                <Icon icon={faChevronCircleDown} className={`${styles.statementItemIcon} ${styles.open} float-right`} />{' '}
                    <span className={`${styles.deletePredicate} float-right mr-4`} onClick={this.toggleDeleteContribution}>
                        <Tooltip message="Delete contribution" hideDefaultIcon={true}>
                            <Icon icon={faTrash} /> Delete
                                                    </Tooltip>
                    </span>
                </ListGroupItem>
                <Collapse isOpen={this.state.collapse}>
                    <div className={styles.listGroupOpen}>
                        <ListGroup flush>
                            <ListGroupItem className={styles.valueItem}>
                                <span className={styles.objectLink}>Configuration 1</span>
                                <span className={`${styles.deleteValue} float-right`} onClick={this.toggleDeleteContribution}>
                                    <Tooltip message="Delete contribution" hideDefaultIcon={true}>
                                        <Icon icon={faTrash} /> Delete
                                                                </Tooltip>
                                </span>
                            </ListGroupItem>
                            <ListGroupItem className={styles.valueItem}>
                                <span className={styles.objectLink}>Configuration 2</span>
                            </ListGroupItem>
                            <ListGroupItem className={styles.valueItem}>
                                <span className="btn btn-link p-0">+ Add value</span>
                            </ListGroupItem>
                            <ListGroupItem className={styles.valueItem}>
                                <InputGroup>
                                    <InputGroupButtonDropdown addonType="prepend" isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                                        <DropdownToggle caret color="primary" className={styles.valueTypeDropdown}>
                                            Object
                                                                    </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem className={styles.dropdownItem}>
                                                <Tooltip message="Choose object to link this to an object, which can contain values on its own" >
                                                    Object
                                                                            </Tooltip>
                                            </DropdownItem>
                                            <DropdownItem className={styles.dropdownItem}>
                                                <Tooltip message="Choose literal for values like numbers or plain text" >
                                                    Literal
                                                                            </Tooltip>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </InputGroupButtonDropdown>
                                    <Input size="sm" />
                                    <InputGroupAddon addonType="append">
                                        <Button color="light" className={styles.valueActionButton}>Cancel</Button>
                                        <Button color="light" className={styles.valueActionButton}>Done</Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            </ListGroupItem>
                        </ListGroup>
                    </div>
                </Collapse>
                <ListGroupItem className={styles.statementItem}>
                    Has evaluation
                                                <Icon icon={faChevronCircleDown} className={`${styles.statementItemIcon} float-right`} />
                </ListGroupItem>
                <ListGroupItem className={styles.statementItem}>
                    Has approach
                                                <Icon icon={faChevronCircleDown} className={`${styles.statementItemIcon} float-right`} />
                </ListGroupItem>
                <ListGroupItem className={`${styles.statementItem} ${styles.statementItemInput}`}>
                    <InputGroup className={styles.addStatement}>
                        <Input size="sm" />
                        <InputGroupAddon addonType="append">
                            <Button color="light" className={styles.addStatementActionButton}>Cancel</Button>
                            <Button color="light" className={styles.addStatementActionButton}>Done</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </ListGroupItem>
            </ListGroup>
        );
    }
}

export default Statements;