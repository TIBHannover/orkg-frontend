import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card, ListGroup, ListGroupItem, CardDeck, Modal, ModalHeader, ModalBody, ModalFooter, Collapse, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { guid } from '../../../../utils';
import Tooltip from '../../../Utils/Tooltip';
import TagsInput from '../../../Utils/TagsInput';
import FormValidator from '../../../Utils/FormValidator';
import { getStatementsBySubject } from '../../../../network';
import styles from '../Contributions.module.scss';
import StatementItem from './StatementItem';
import AddStatement from './AddStatement';

class Statements extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showAddStatement: false,
            newPredicateValue: '',
            statements: [
                {
                    predicateLabel: 'has results',
                    predicateId: 'fake-1',
                },
                {
                    predicateLabel: 'has evluation',
                    predicateId: 'fake-2',
                },
                {
                    predicateLabel: 'has approach',
                    predicateId: 'fake-3',
                }
            ]
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

    handleAddStatement = () => {
        this.handleHideAddStatement();
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    toggleCollapseStatement = (clickedIndex) => {
        let statements = [...this.state.statements];

        // toggle (=show/close) clicked item, hide all other items
        for (let i = 0; i < statements.length; i++) {
            statements[i].collapse = (i == clickedIndex) ? !statements[i].collapse : false;
        }

        this.setState({ statements });
    }

    handleAdd = ({ predicateId, propertyLabel }) => {
        console.log('predicateId', predicateId);
        console.log('label', propertyLabel);

        predicateId = !predicateId ? 'new-' + guid() : predicateId;

        let statements = [...this.state.statements];

        statements.push({
            predicateLabel: propertyLabel,
            predicateId
        });

        this.setState(
            { statements },
            () => { // select the just created property only after updating the state in sync
                this.toggleCollapseStatement(statements.length - 1)
            }
        );
    }

    handleDelete = (predicateId) => {
        console.log('handle delete:', predicateId);

        let statements = [...this.state.statements];

        var indexToDelete = -1;

        for (let i = 0; i < statements.length; i++) {
            if (statements[i].predicateId == predicateId) {
                indexToDelete = i;
                break;
            }
        }
        console.log(indexToDelete);

        if (indexToDelete > -1) {
            statements.splice(indexToDelete, 1);

            this.setState({ statements });
        }
    }

    render() {
        return (
            <ListGroup>
                {this.state.statements.map((statement, index) => {
                    return <StatementItem
                        predicateLabel={statement.predicateLabel}
                        predicateId={statement.predicateId}
                        key={'statement-' + index}
                        collapse={statement.collapse}
                        index={index}
                        toggleCollapseStatement={this.toggleCollapseStatement}
                        handleDelete={this.handleDelete}
                    />
                })}

                <AddStatement handleAdd={this.handleAdd} />
            </ListGroup>
        );
    }
}

export default Statements;