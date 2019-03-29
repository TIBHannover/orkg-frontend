import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card, ListGroup, ListGroupItem, CardDeck, Modal, ModalHeader, ModalBody, ModalFooter, Collapse, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronCircleDown, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { guid, deleteArrayEntryByObjectValue } from '../../../../utils';
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
            label: 'Configuration 1',
            resourceId: this.props.resourceId, //THIS IS THE MAIN id of the statement list
            statements: [ //the subject of the first level is the paper itself, it does not exist yet, so it is now shown in the state
                {
                    predicateId: 'fake-st-1',
                    predicateLabel: 'has results',
                    values: [
                        {
                            type: 'object',
                            label: 'Result 1',
                            id: 'fake-ob-1'
                        },
                        {
                            type: 'object',
                            label: 'Result 2',
                            id: 'fake-ob-2',
                        },
                        {
                            type: 'literal',
                            label: 'This is a textual result',
                            id: 'fake-ob-3',
                        }
                    ]
                },
                {
                    predicateLabel: 'has value',
                    predicateId: 'fake-st-2',
                    values: [{
                        type: 'literal',
                        label: 'Correct positives',
                        id: 'fake-ob-3',
                    }]
                },
                {
                    predicateLabel: 'has metric',
                    predicateId: 'fake-st-3',
                    values: [{
                        type: 'literal',
                        label: '21',
                        id: 'fake-ob-3',
                    }]
                }
            ]
        }
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
        let statements = deleteArrayEntryByObjectValue(this.state.statements, 'predicateId', predicateId);

        this.setState({ statements });
    }

    handleDeleteValue = (valueId, predicateId) => {
        let statements = [...this.state.statements];
        console.log('value', valueId);
        console.log('predicate', predicateId);

        let predicateIndex = statements.findIndex(x => x.predicateId === predicateId);
        console.log(predicateIndex);

        statements[predicateIndex].values = deleteArrayEntryByObjectValue(statements[predicateIndex].values, 'id', valueId);

        console.log(statements);

        this.setState({ statements });
    }

    handleAddValue = ({ valueId, valueLabel, valueType, predicateId }) => {
        let statements = [...this.state.statements];
        let predicateIndex = statements.findIndex(x => x.predicateId === predicateId);

        if (statements[predicateIndex].values === undefined) {
            statements[predicateIndex].values = [];
        }

        statements[predicateIndex].values.push(
            {
                id: valueId,
                type: valueType,
                label: valueLabel,
            }
        );

        this.setState({ statements });
    }

    statements = () => {
        return <ListGroup className={styles.listGroupEnlarge}>
            {this.state.statements.map((statement, index) => {
                // statement is provided in seperate props, so the props can be validated more easily
                return <StatementItem
                    values={statement.values}
                    predicateLabel={statement.predicateLabel}
                    predicateId={statement.predicateId}
                    key={'statement-' + index}
                    collapse={statement.collapse}
                    index={index}
                    toggleCollapseStatement={this.toggleCollapseStatement}
                    handleDelete={this.handleDelete}
                    handleDeleteValue={this.handleDeleteValue}
                    handleAddValue={this.handleAddValue}
                />
            })}

            <AddStatement handleAdd={this.handleAdd} />
        </ListGroup>;
    }

    addLevel = (level, maxLevel) => {
        return maxLevel != 0 ? <div className={styles.levelBox}>
            {maxLevel != level + 1 && this.addLevel(level + 1, maxLevel)}
            {maxLevel == level + 1 && this.statements()}
        </div> : this.statements();
    }

    render() {
        if (this.props.hidden) {
            return <></>;
        }

        let elements = this.addLevel(0, this.props.level);

        return <>
            {this.props.level != 0 ? <>
                <br />
                <div className="btn btn-link p-0 border-0 align-baseline mb-3">
                    <Icon icon={faArrowLeft} /> Back
                </div>
                <strong className="ml-4 float-right">{this.state.label}</strong>
            </> : ''}

            {elements}
        </>;

        /*return (
            <div className={styles.levelBox}
            > <div className={styles.levelBox}>
            <ListGroup className={styles.listGroupEnlarge}>
                {this.state.statements.map((statement, index) => {
                    // statement is provided in seperate props, so the props can be validated more easily
                    return <StatementItem
                        values={statement.values}
                        predicateLabel={statement.predicateLabel}
                        predicateId={statement.predicateId}
                        key={'statement-' + index}
                        collapse={statement.collapse}
                        index={index}
                        toggleCollapseStatement={this.toggleCollapseStatement}
                        handleDelete={this.handleDelete}
                        handleDeleteValue={this.handleDeleteValue}
                        handleAddValue={this.handleAddValue}
                    />
                })}

                <AddStatement handleAdd={this.handleAdd} />
            </ListGroup>
            </div></div>
        );*/
    }
}

export default Statements;