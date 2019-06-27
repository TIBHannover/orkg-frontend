import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../network';
import { Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import AuthorsInput from '../../Utils/AuthorsInput';
import FormValidator from '../../Utils/FormValidator';
import { connect } from 'react-redux';
import { updateGeneralData, nextStep } from '../../../actions/addPaper';
import { CSSTransitionGroup } from 'react-transition-group'
import styled from 'styled-components';
import moment from 'moment'
import PropTypes from 'prop-types';

const Container = styled.div`
    &.fadeIn-enter {
        opacity:0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity:1;
        transition:1s opacity;
    }

    &.fadeIn-leave.fadeIn-leave-active {
        display:none;
    }

    &.slideDown-enter {
        max-height:0;
        overflow:hidden;
    }

    &.slideDown-enter.slideDown-enter-active {
        max-height:1000px;
        transition:1s;
    }

    &.slideDown-leave.slideDown-leave-active {
        display:none;
    }
`;

class GeneralData extends Component {
    constructor(props) {
        super(props);

        // TODO: consistency: remove binds here and use arrow functions 
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDataEntryClick = this.handleDataEntryClick.bind(this);
        this.handleAuthorsChange = this.handleAuthorsChange.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);

        this.years = range(1900, new Date().getFullYear()).reverse();

        this.validator = new FormValidator([
            {
                field: 'doi',
                method: 'isEmpty',
                validWhen: false,
                message: 'Please enter the DOI, or select \'manual\' to enter the paper details yourself'
            }
        ]);

        this.state = {
            doi: this.props.doi,
            isFetching: false,
            dataEntry: 'doi',
            showDoiTable: false,
            paperTitle: this.props.title,
            paperAuthors: this.props.authors,
            paperPublicationMonth: this.props.publicationMonth,
            paperPublicationYear: this.props.publicationYear,
            validation: this.validator.valid(),
        }
    }

    //TODO this logic should be placed inside an action creator 
    handleLookupClick = async () => {

        this.setState({
            doi: this.state.doi.trim(),
            showDoiTable: false,
        });

        let validation = this.validator.validate({ doi: this.state.doi });
        this.setState({ validation });

        if (!validation.isValid) {
            return;
        }

        this.setState({
            isFetching: true,
        });

        try {
            const responseJson = await submitGetRequest(crossrefUrl + this.state.doi);

            let paperTitle = '', paperAuthors = [], paperPublicationMonth = 0, paperPublicationYear = 0;

            try {
                paperTitle = responseJson.message.title[0];
                paperAuthors = responseJson.message.author.map((author, index) => {
                    const newAuthor = {
                        label: author.given + ' ' + author.family,
                        id: author.given + ' ' + author.family,
                    };
                    return newAuthor;
                });
                paperPublicationMonth = responseJson.message.created['date-parts'][0][1];
                paperPublicationYear = responseJson.message.created['date-parts'][0][0];
            } catch (e) {
                console.log('Error setting paper data: ', e);
            }

            this.setState({
                isFetching: false,
                showDoiTable: true,
                paperTitle,
                paperAuthors,
                paperPublicationMonth,
                paperPublicationYear,
            });
        } catch (e) {
            let validation = this.validator.setError({
                field: 'doi',
                message: e.statusCode === 404 ? 'No paper has been found' : 'An error occurred, reload the page and try again',
            });

            this.setState({
                isFetching: false,
                validation,
            });
        }
    }

    handleInputChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleMonthChange = (e) => {
        this.setState({
            [e.target.name]: parseInt(e.target.value)
        });
    }

    handleDataEntryClick(selection) {
        this.setState({
            dataEntry: selection
        });
    }

    handleAuthorsChange(tags) {
        tags = tags ? tags : [];
        this.setState({
            paperAuthors: tags
        });
    }

    handleNextClick() {
        // TODO do some sort of validation, before proceeding to the next step
        let { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi } = this.state;

        this.props.updateGeneralData({
            title: paperTitle,
            authors: paperAuthors,
            publicationMonth: paperPublicationMonth,
            publicationYear: paperPublicationYear,
            doi: doi,
        });

        this.props.nextStep();
    }

    submitHandler = (e) => {
        e.preventDefault();
    }

    render() {
        return (
            <div>
                <h2 className="h4 mt-4">General paper data</h2>

                <ButtonGroup className="float-right" style={{ marginTop: '-30px' }}>
                    <Button
                        size="sm"
                        color={this.state.dataEntry === 'doi' ? 'primary' : 'light'}
                        onClick={() => this.handleDataEntryClick('doi')}
                    >
                        By DOI
                    </Button>
                    <Button
                        size="sm"
                        color={this.state.dataEntry === 'manually' ? 'primary' : 'light'}
                        onClick={() => this.handleDataEntryClick('manually')}
                    >
                        Manually
                    </Button>
                </ButtonGroup>

                <CSSTransitionGroup
                    transitionName="fadeIn"
                    transitionEnterTimeout={500}
                    transitionLeave={false}
                >
                    {this.state.dataEntry === 'doi' ?
                        <Container key={1}>
                            <Form className="mt-4" onSubmit={this.submitHandler}>
                                <FormGroup>
                                    <Label for="paperDoi">
                                        <Tooltip message="Digital Object Identifier or DOI is a persistent identifier or handle used to uniquely identify objects">Paper DOI</Tooltip>
                                    </Label>
                                    <InputGroup>
                                        <Input type="text" name="doi" id="paperDoi" value={this.state.doi} onChange={this.handleInputChange} invalid={this.state.validation.doi.isInvalid} />
                                        <FormFeedback className="order-1">{this.state.validation.doi.message}</FormFeedback> {/* Need to set order-1 here to fix Bootstrap bug of missing rounded borders */}
                                        <InputGroupAddon addonType="append">
                                            <Button
                                                outline
                                                color="primary"
                                                style={{ minWidth: 130 }}
                                                onClick={this.handleLookupClick}
                                                disabled={this.state.isFetching}
                                                data-test="lookupDoi"
                                            >
                                                {!this.state.isFetching ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                            </Form>

                            <CSSTransitionGroup
                                transitionName="slideDown"
                                transitionEnterTimeout={500}
                                transitionLeaveTimeout={300}
                            >
                                {this.state.showDoiTable ?
                                    <Container key={1} className="mt-5">
                                        <h3 className="h4 mb-3">Lookup result</h3>
                                        <Card body>
                                            <Table className="mb-0">
                                                <tbody>
                                                    <tr className="table-borderless">
                                                        <td><strong>Paper title:</strong> {this.state.paperTitle}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <strong>Authors:</strong> {this.state.paperAuthors.map((author, index) => (
                                                                <span key={index}>{this.state.paperAuthors.length > index + 1 ? author.label + ', ' : author.label}</span>
                                                            )
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Publication date:</strong> {moment(this.state.paperPublicationMonth, 'M').format('MMMM')} {this.state.paperPublicationYear}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Card>
                                    </Container>
                                    : ''}
                            </CSSTransitionGroup>
                        </Container>
                        :
                        <Container key={2}>
                            <Form className="mt-4" onSubmit={this.submitHandler}>
                                <FormGroup>
                                    <Label for="paperTitle">
                                        <Tooltip message="The main title of the paper">Paper title</Tooltip>
                                    </Label>
                                    <Input type="text" name="paperTitle" id="paperTitle" value={this.state.paperTitle} onChange={this.handleInputChange} />
                                    <FormFeedback />
                                </FormGroup>
                                <Row form>
                                    <Col md={6} className="pr-3">
                                        <FormGroup>
                                            <Label for="paperAuthors">
                                                <Tooltip message="The author or authors of the paper. Enter both the first and last name">Paper authors</Tooltip>
                                            </Label>
                                            <AuthorsInput handler={this.handleAuthorsChange} value={this.state.paperAuthors} />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} className="pl-3">
                                        <FormGroup>
                                            <Label for="paperCreationDate">
                                                <Tooltip message="The publication date of the paper, in the form of month and year">Publication date</Tooltip>
                                            </Label>
                                            <Row form>
                                                <Col md={6} >
                                                    <Input type="select" name="paperPublicationMonth" aria-label="Select publication month" value={this.state.paperPublicationMonth} onChange={this.handleMonthChange}>
                                                        {moment.months().map((el, index) => {
                                                            return <option value={index + 1} key={index + 1}>{el}</option>
                                                        })}
                                                    </Input>
                                                </Col>
                                                <Col md={6} >
                                                    <Input type="select" name="paperPublicationYear" aria-label="Select publication year" value={this.state.paperPublicationYear} onChange={this.handleInputChange}>
                                                        {this.years.map((year) => <option key={year}>{year}</option>)}
                                                    </Input>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Form>
                        </Container>
                    }
                </CSSTransitionGroup>
                <hr className="mt-5 mb-3" />

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick} data-test="nextStep">Next step</Button>
            </div>
        );
    }
}

GeneralData.propTypes = {
    doi: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    publicationMonth: PropTypes.number.isRequired,
    publicationYear: PropTypes.number.isRequired,
    updateGeneralData: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    doi: state.addPaper.doi,
    title: state.addPaper.title,
    authors: state.addPaper.authors,
    publicationMonth: state.addPaper.publicationMonth,
    publicationYear: state.addPaper.publicationYear,
});

const mapDispatchToProps = dispatch => ({
    updateGeneralData: (data) => dispatch(updateGeneralData(data)),
    nextStep: () => dispatch(nextStep()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GeneralData);