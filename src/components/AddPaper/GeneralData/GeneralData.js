import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ProgressBar from './ProgressBar';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import TagsInput from '../../Utils/TagsInput';
import FormValidator from '../../Utils/FormValidator';

class GeneralData extends Component {
    constructor(props) {
        super(props);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleDataEntryClick = this.handleDataEntryClick.bind(this);
        this.handleAuthorsChange = this.handleAuthorsChange.bind(this);

        this.years = range(1900, new Date().getFullYear()).reverse();
        this.months = {
            1: 'January',
            2: 'February',
            3: 'March',
            4: 'April',
            5: 'May',
            6: 'June',
            7: 'July',
            8: 'August',
            9: 'September',
            10: 'October',
            11: 'November',
            12: 'December',
        };

        this.validator = new FormValidator([
            {
                field: 'doi',
                method: 'isEmpty',
                validWhen: false,
                message: 'Please enter the DOI, or select \'manual\' to enter the paper details yourself'
            }
        ]);

        this.state = {
            doi: '10.1109/jiot.2014.2312291',
            isFetching: false,
            dataEntry: 'doi',
            showDoiTable: false,
            paperTitle: '',
            paperAuthors: [],
            paperPublicationMonth: 0,
            paperPublicationYear: 0,
            validation: this.validator.valid(),
        }
    }

    //TODO this logic should be placed inside an action creator when redux is implemented
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
            console.log(responseJson);

            let paperTitle = '', paperAuthors = [], paperPublicationMonth = 0, paperPublicationYear = 0;

            try {
                paperTitle = responseJson.message.title[0];
                paperAuthors = responseJson.message.author.map(function (author) {
                    return author.given + ' ' + author.family;
                });
                paperPublicationMonth = responseJson.message.created['date-parts'][0][1];
                paperPublicationYear = '20' + responseJson.message.created['date-parts'][0][2]; // year is returned in short format, so prepend 20
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
                message: 'No paper has been found',
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

    handleDataEntryClick(selection) {
        this.setState({
            dataEntry: selection
        });
    }

    handleAuthorsChange(tags) {
        this.setState({
            paperAuthors: tags
        });
    }

    render() {
        const monthsOptions = Object.keys(this.months).map((key) => {
            return <option value={key} key={key}>{this.months[key]}</option>
        });

        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Add paper</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <ProgressBar currentStep={1} />
                    <hr />

                    <h2 className="h4 mt-4">General paper data</h2>

                    <ButtonGroup className="float-right" style={{ marginTop: '-30px' }}>
                        <Button size="sm"
                            color={this.state.dataEntry === 'doi' ? 'primary' : 'light'}
                            onClick={() => this.handleDataEntryClick('doi')}>
                            By DOI
                        </Button>
                        <Button size="sm"
                            color={this.state.dataEntry === 'manually' ? 'primary' : 'light'}
                            onClick={() => this.handleDataEntryClick('manually')}>
                            Manually
                        </Button>
                    </ButtonGroup>

                    {this.state.dataEntry === 'doi' ?
                        <div>
                            <Form className="mt-4">
                                <FormGroup>
                                    <Label for="paperDoi">
                                        <Tooltip message="Digital Object Identifier or DOI is a persistent identifier or handle used to uniquely identify objects">Paper DOI</Tooltip>
                                    </Label>
                                    <InputGroup>
                                        <Input type="text" name="doi" id="paperDoi" value={this.state.doi} onChange={this.handleInputChange} invalid={this.state.validation.doi.isInvalid} />
                                        <FormFeedback className="order-1">{this.state.validation.doi.message}</FormFeedback> {/* Need to set order-1 here to fix Bootstrap bug of missing rounded borders */}
                                        <InputGroupAddon addonType="append">
                                            <Button outline color="primary" style={{ minWidth: 130 }}
                                                onClick={this.handleLookupClick}
                                                disabled={this.state.isFetching}>
                                                {!this.state.isFetching ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                            </Form>

                            {this.state.showDoiTable ?
                                <div>
                                    <h3 className="h4 mt-5 mb-3">Lookup result</h3>
                                    <Card body>
                                        <Table className="mb-0">
                                            <tbody>
                                                <tr className="table-borderless">
                                                    <td><strong>Paper title:</strong> {this.state.paperTitle}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Authors:</strong> {this.state.paperAuthors}</td>
                                                </tr>
                                                <tr>
                                                    <td><strong>Publication date:</strong> {this.months[this.state.paperPublicationMonth]} {this.state.paperPublicationYear}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Card>
                                </div>
                                : ''}
                        </div>
                        :
                        <Form className="mt-4">
                            <FormGroup>
                                <Label for="paperTitle">
                                    <Tooltip message="The main title of the paper">Paper title</Tooltip>
                                </Label>
                                <Input type="text" name="paperTitle" id="paperTitle" value={this.state.paperTitle} onChange={this.handleInputChange} invalid={this.state.errorMessage} />
                                <FormFeedback>{this.state.errorMessage}</FormFeedback>
                            </FormGroup>
                            <Row form>
                                <Col md={6} className="pr-3">
                                    <FormGroup>
                                        <Label for="paperAuthors">
                                            <Tooltip message="The author or authors of the paper. Enter both the first and last name">Paper authors</Tooltip>
                                        </Label>
                                        <TagsInput handler={this.handleAuthorsChange} value={this.state.paperAuthors} />
                                    </FormGroup>
                                </Col>
                                <Col md={6} className="pl-3">
                                    <FormGroup>
                                        <Label for="paperCreationDate">
                                            <Tooltip message="The publication date of the paper, in the form of month and year">Publication date</Tooltip>
                                        </Label>
                                        <Row form>
                                            <Col md={6} >
                                                <Input type="select" name="paperPublicationMonth" aria-label="Select publication month" value={this.state.paperPublicationMonth} onChange={this.handleInputChange}>
                                                    {monthsOptions}
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
                    }

                    <hr className="mt-5 mb-3" />

                    <Button color="primary" className="float-right mb-4">Next step</Button>
                </Container>
            </div>
        );
    }
}

export default GeneralData;