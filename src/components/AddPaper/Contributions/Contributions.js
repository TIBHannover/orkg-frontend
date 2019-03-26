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
import Statements from './Statements/Statements';

class GeneralData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            researchProblems: [],
            collapse: false, //replace
            dropdownOpen: false, //replace
        }
    }

    handleNextClick = () => {
        this.props.setParentState({
            step: 4,
        });
    }

    handlePreviousClick = () => {
        this.props.setParentState({
            step: 2,
        });
    }

    toggleDeleteContribution = () => {
        this.setState(prevState => ({
            deleteContributionModal: !prevState.deleteContributionModal
        }));
    }

    handleResearchProblemsChange = (problems) => {
        this.setState({
            researchProblems: problems
        });
    }

    render() {
        return (
            <div>
                <h2 className="h4 mt-4 mb-5">Specify research contributions</h2>

                <Container>
                    <Row noGutters={true}>
                        <Col xs="3">
                            <ul className={styles.contributionsList}>
                                <li className={styles.activeContribution}>
                                    Contribution 1
                                    <span className={`${styles.deleteContribution} float-right mr-1`}>
                                        <Tooltip message="Delete contribution" hideDefaultIcon={true}>
                                            <Icon icon={faTrash} onClick={this.toggleDeleteContribution} />
                                        </Tooltip>
                                    </span>
                                </li>
                                <li className={`${styles.addContribution} text-primary`}>
                                    <span>+ Add another contribution</span>
                                </li>
                            </ul>
                        </Col>
                        <Col xs="9">
                            <div className={styles.contribution}>
                                <Form>
                                    <FormGroup>
                                        <Label>
                                            <Tooltip message="Specify the research problems that this contributions addresses. Normally, a research problem consists of very few words (around 2 or 3)">Research problems</Tooltip>
                                        </Label>
                                        <TagsInput handler={this.handleResearchProblemsChange} value={this.state.researchProblems} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label>
                                            <Tooltip message="Provide details about this contribution by making statements. Some suggestions are already displayed, you can use this when it is useful, or delete it when it is not">Statements</Tooltip>
                                        </Label>
                                        
                                        <Statements />

                                    </FormGroup>
                                </Form>
                            </div>
                        </Col>
                    </Row>
                </Container>

                <Modal isOpen={this.state.deleteContributionModal} toggle={this.toggleDeleteContribution}>
                    <ModalHeader toggle={this.toggleDeleteContribution}>Are you sure?</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete this contribution and its corresponding statements?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={this.toggleDeleteContribution}>Cancel</Button>{' '}
                        <Button color="primary" onClick={this.toggleDeleteContribution}>Delete</Button>
                    </ModalFooter>
                </Modal>

                <hr className="mt-5 mb-3" />
                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Next step</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.handlePreviousClick}>Previous step</Button>
            </div>
        );
    }
}

export default GeneralData;