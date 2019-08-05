import React, { Component } from 'react';
import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  ButtonGroup,
  FormFeedback,
  Table,
  Card,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { range } from '../../../utils';
import Tooltip from '../../Utils/Tooltip';
import AuthorsInput from '../../Utils/AuthorsInput';
import FormValidator from '../../Utils/FormValidator';
import { connect } from 'react-redux';
import { updateGeneralData, nextStep } from '../../../actions/addPaper';
import { CSSTransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import TextareaAutosize from 'react-autosize-textarea';
import classNames from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import Cite from 'citation-js';

const Container = styled.div`
  &.fadeIn-enter {
    opacity: 0;
  }

  &.fadeIn-enter.fadeIn-enter-active {
    opacity: 1;
    transition: 1s opacity;
  }

  &.fadeIn-leave.fadeIn-leave-active {
    display: none;
  }

  &.slideDown-enter {
    max-height: 0;
    overflow: hidden;
  }

  &.slideDown-enter.slideDown-enter-active {
    max-height: 1000px;
    transition: 1s;
  }

  &.slideDown-leave.slideDown-leave-active {
    display: none;
  }
`;

const StyledTextareaAutosize = styled(TextareaAutosize)`
  border-radius: 12px !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
`;

class GeneralData extends Component {
  constructor(props) {
    super(props);

    this.validator = new FormValidator([
      {
        field: 'entry',
        method: 'isEmpty',
        validWhen: false,
        message:
          'Please enter the DOI, Bibtex or select \'Manually\' to enter the paper details yourself',
      },
    ]);

    this.lookup = React.createRef();

    this.state = {
      entry: '',
      doi: this.props.doi,
      isFetching: false,
      dataEntry: 'doi',
      showLookupTable: false,
      paperTitle: this.props.title,
      paperAuthors: this.props.authors,
      paperPublicationMonth: this.props.publicationMonth,
      paperPublicationYear: this.props.publicationYear,
      validation: this.validator.valid(),
    };
  }

  //TODO this logic should be placed inside an action creator
  handleLookupClick = async () => {
    this.setState({
      entry: this.state.entry.trim(),
      showLookupTable: false,
    });

    this.lookup.current.blur();

    let validation = this.validator.validate({ entry: this.state.entry });
    this.setState({ validation });

    if (!validation.isValid) {
      return;
    }

    this.setState({
      isFetching: true,
    });

    await Cite.async(this.state.entry)
      .catch((e) => {
        let validation;
        switch (e.message) {
          case 'This format is not supported or recognized':
            validation = this.validator.setError({
              field: 'entry',
              message:
                'This format is not supported or recognized. Please enter a valid DOI or Bibtex or select \'Manually\' to enter the paper details yourself',
            });
            break;
          case 'Server responded with status code 404':
            validation = this.validator.setError({
              field: 'entry',
              message: 'No paper has been found',
            });
            break;
          default:
            validation = this.validator.setError({
              field: 'entry',
              message: 'An error occurred, reload the page and try again',
            });
            break;
        }
        this.setState({
          isFetching: false,
          paperTitle: this.state.entry, // Probably the user entered a paper title
          validation,
        });
        return null;
      })
      .then((paper) => {
        if (paper) {
          let paperTitle = '',
            paperAuthors = [],
            paperPublicationMonth = null,
            paperPublicationYear = null,
            doi = '';
          try {
            paperTitle = paper.data[0].title;
            paperAuthors = paper.data[0].author.map((author, index) => {
              let fullname = [author.given, author.family].join(' ').trim();
              const newAuthor = {
                label: fullname,
                id: fullname,
              };
              return newAuthor;
            });
            paperPublicationMonth = paper.data[0].issued['date-parts'][0][1];
            paperPublicationYear = paper.data[0].issued['date-parts'][0][0];
            doi = paper.data[0].DOI;
          } catch (e) {
            console.log('Error setting paper data: ', e);
          }

          this.setState({
            isFetching: false,
            showLookupTable: true,
            paperTitle,
            paperAuthors,
            paperPublicationMonth,
            paperPublicationYear,
            doi: doi,
          });
        }
      });
  };

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleMonthChange = (e) => {
    this.setState({
      [e.target.name]: parseInt(e.target.value),
    });
  };

  handleDataEntryClick = (selection) => {
    this.setState({
      dataEntry: selection,
    });
  };

  handleAuthorsChange = (tags) => {
    tags = tags ? tags : [];
    this.setState({
      paperAuthors: tags,
    });
  };

  handleNextClick = () => {
    // TODO do some sort of validation, before proceeding to the next step
    let {
      paperTitle,
      paperAuthors,
      paperPublicationMonth,
      paperPublicationYear,
      doi,
      entry,
    } = this.state;

    this.props.updateGeneralData({
      title: paperTitle,
      authors: paperAuthors,
      publicationMonth: paperPublicationMonth,
      publicationYear: paperPublicationYear,
      doi: doi,
      entry: entry,
    });

    this.props.nextStep();
  };

  submitHandler = (e) => {
    e.preventDefault();
  };

  render() {
    const entryFieldClasses = classNames({
      'form-control': true,
      'is-invalid': this.state.validation.entry.isInvalid,
    });

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
          {(() => {
            switch (this.state.dataEntry) {
              case 'doi':
                return (
                  <Container key={1}>
                    <Form className="mt-4" onSubmit={this.submitHandler}>
                      <FormGroup>
                        <Label for="paperDoi">
                          <Tooltip message="Digital Object Identifier or DOI is a persistent identifier or handle used to uniquely identify objects">
                            Paper DOI
                          </Tooltip>
                          <span className={'mr-1 ml-1'}> or</span>
                          <Tooltip message="A BibTeX entry consists of the type, a citation-key and a number of tags which define various characteristics of the paper.">
                            Bibtex
                          </Tooltip>
                        </Label>
                        <InputGroup>
                          <StyledTextareaAutosize
                            type="text"
                            name="entry"
                            id="paperDoi"
                            className={entryFieldClasses}
                            placeholder="Enter a DOI or Bibtex"
                            value={this.state.entry}
                            onChange={this.handleInputChange}
                          />
                          <FormFeedback className="order-1">
                            {this.state.validation.entry.message}
                          </FormFeedback>{' '}
                          {/* Need to set order-1 here to fix Bootstrap bug of missing rounded borders */}
                          <InputGroupAddon addonType="append">
                            <Button
                              outline
                              color="primary"
                              innerRef={this.lookup}
                              style={{ minWidth: 130 }}
                              onClick={this.handleLookupClick}
                              disabled={this.state.isFetching}
                              data-test="lookupDoi"
                            >
                              {!this.state.isFetching ? (
                                'Lookup'
                              ) : (
                                <FontAwesomeIcon icon={faSpinner} spin />
                              )}
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
                      {this.state.showLookupTable ? (
                        <Container key={1} className="mt-5">
                          <h3 className="h4 mb-3">
                            Lookup result
                            <Button
                              className={'pull-right ml-1'}
                              outline
                              size="sm"
                              onClick={() => this.handleDataEntryClick('manually')}
                            >
                              Edit
                            </Button>
                          </h3>
                          <Card body>
                            <Table className="mb-0">
                              <tbody>
                                <tr className="table-borderless">
                                  <td>
                                    <strong>Paper title:</strong> {this.state.paperTitle}
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <strong>Authors:</strong>{' '}
                                    {this.state.paperAuthors.map((author, index) => (
                                      <span key={index}>
                                        {this.state.paperAuthors.length > index + 1
                                          ? author.label + ', '
                                          : author.label}
                                      </span>
                                    ))}
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <strong>Publication date:</strong>{' '}
                                    {this.state.paperPublicationMonth
                                      ? moment(this.state.paperPublicationMonth, 'M').format('MMMM')
                                      : ''}{' '}
                                    {this.state.paperPublicationYear}
                                  </td>
                                </tr>
                              </tbody>
                            </Table>
                          </Card>
                        </Container>
                      ) : (
                        ''
                      )}
                    </CSSTransitionGroup>
                  </Container>
                );
              default:
                //Manually
                return (
                  <Container key={2}>
                    <Form className="mt-4" onSubmit={this.submitHandler}>
                      <FormGroup>
                        <Label for="paperTitle">
                          <Tooltip message="The main title of the paper">Paper title</Tooltip>
                        </Label>
                        <Input
                          type="text"
                          name="paperTitle"
                          id="paperTitle"
                          value={this.state.paperTitle}
                          onChange={this.handleInputChange}
                        />
                        <FormFeedback />
                      </FormGroup>
                      <Row form>
                        <Col md={6} className="pr-3">
                          <FormGroup>
                            <Label for="paperAuthors">
                              <Tooltip message="The author or authors of the paper. Enter both the first and last name">
                                Paper authors
                              </Tooltip>
                            </Label>
                            <AuthorsInput
                              handler={this.handleAuthorsChange}
                              value={this.state.paperAuthors}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6} className="pl-3">
                          <FormGroup>
                            <Label for="paperCreationDate">
                              <Tooltip message="The publication date of the paper, in the form of month and year">
                                Publication date
                              </Tooltip>
                            </Label>
                            <Row form>
                              <Col md={6}>
                                <Input
                                  type="select"
                                  name="paperPublicationMonth"
                                  aria-label="Select publication month"
                                  value={this.state.paperPublicationMonth}
                                  onChange={this.handleMonthChange}
                                >
                                  {moment.months().map((el, index) => {
                                    return (
                                      <option value={index + 1} key={index + 1}>
                                        {el}
                                      </option>
                                    );
                                  })}
                                </Input>
                              </Col>
                              <Col md={6}>
                                <Input
                                  type="select"
                                  name="paperPublicationYear"
                                  aria-label="Select publication year"
                                  value={this.state.paperPublicationYear}
                                  onChange={this.handleInputChange}
                                >
                                  {range(1900, moment().year())
                                    .reverse()
                                    .map((year) => (
                                      <option key={year}>{year}</option>
                                    ))}
                                </Input>
                              </Col>
                            </Row>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </Container>
                );
            }
          })()}
        </CSSTransitionGroup>
        <hr className="mt-5 mb-3" />

        <Button
          color="primary"
          className="float-right mb-4"
          onClick={this.handleNextClick}
          data-test="nextStep"
        >
          Next step
        </Button>
      </div>
    );
  }
}

GeneralData.propTypes = {
  entry: PropTypes.string.isRequired,
  doi: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  authors: PropTypes.array.isRequired,
  publicationMonth: PropTypes.number.isRequired,
  publicationYear: PropTypes.number.isRequired,
  updateGeneralData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  entry: state.addPaper.entry,
  doi: state.addPaper.doi,
  title: state.addPaper.title,
  authors: state.addPaper.authors,
  publicationMonth: state.addPaper.publicationMonth,
  publicationYear: state.addPaper.publicationYear,
});

const mapDispatchToProps = (dispatch) => ({
  updateGeneralData: (data) => dispatch(updateGeneralData(data)),
  nextStep: () => dispatch(nextStep()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GeneralData);
