import React, { Component } from 'react';
import { Button, Alert, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { semanticScholarUrl, submitGetRequest, getAnnotations } from '../../../network';
import { connect } from 'react-redux';
import {
  updateAbstract, nextStep, previousStep, createContribution, prefillStatements, createAnnotation, clearAnnotations,
  toggleAbstractDialog, setAbstractDialogView
} from '../../../actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import AbstractInputView from './AbstractInputView';
import AbstractAnnotatorView from './AbstractAnnotatorView';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { guid } from '../../../utils';
import toArray from 'lodash/toArray';


class Abstract extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAbstractLoading: false,
      isAbstractFailedLoading: false,
      isAnnotationLoading: false,
      isAnnotationFailedLoading: false,
      annotationError: null,
      showError: false,
      classOptions: [],
      certaintyThreshold: [0.5],
      validation: true,
    };
  }

  componentDidMount() {
    this.fetchAbstract();
  }

  getAnnotation = () => {
    this.setState({ isAnnotationLoading: true });
    return getAnnotations(this.props.abstract)
      .then((data) => {
        let annotated = [];
        let ranges = {};
        if (data && data.entities) {
          data.entities
            .map((entity) => {
              let text = data.text.substring(entity[2][0][0], entity[2][0][1]);
              if (annotated.indexOf(text.toLowerCase()) < 0) {
                annotated.push(text.toLowerCase());
                // Predicate label entity[1]
                let rangeClass = this.state.classOptions.filter(c => c.label.toLowerCase() === entity[1].toLowerCase())
                if (rangeClass.length > 0) {
                  rangeClass = rangeClass[0];
                } else {
                  rangeClass = { id: entity[1], label: entity[1] }
                }
                ranges[entity[0]] = {
                  text: text,
                  start: entity[2][0][0],
                  end: entity[2][0][1] - 1,
                  certainty: entity[3],
                  class: rangeClass,
                };
                return ranges[entity[0]];
              } else {
                return null;
              }
            })
            .filter((r) => r);
        }
        //Clear annotations
        this.props.clearAnnotations();
        toArray(ranges).map((range) => {
          return this.props.createAnnotation(range)
        }
        );
        this.setState({
          isAnnotationLoading: false,
          isSimilaireContributionsLoading: true,
        });
      })
      .catch((e) => {
        if (e.statusCode === 422) {
          this.setState({ annotationError: 'Failed to annotate the abstract, please change the abstract and try again', isAnnotationLoading: false, isAnnotationFailedLoading: true });
        } else {
          this.setState({ annotationError: null, isAnnotationLoading: false, isAnnotationFailedLoading: true });
        }
        return null;
      });
  };

  fetchAbstract = async () => {
    if (!this.props.abstract) {
      let DOI;
      try {
        DOI = this.props.doi.substring(this.props.doi.indexOf('10.'));
      } catch{
        DOI = false
      }
      if (!this.props.title || !DOI) {
        this.props.setAbstractDialogView('input');
        return;
      }
      this.setState({
        isAbstractLoading: true,
      });
      return submitGetRequest(semanticScholarUrl + DOI).then((data, reject) => {
        if (!data.abstract) {
          return reject;
        }
        return data.abstract;
      }).then((abstract) => {
        // remove line breaks from the abstract
        abstract = abstract.replace(/(\r\n|\n|\r)/gm, ' ');

        this.setState({
          isAbstractLoading: false,
        });
        this.props.updateAbstract(abstract);
        this.getAnnotation();
      }).catch(() => {
        this.handleChangeAbstract();
        this.setState({ isAbstractFailedLoading: true, isAbstractLoading: false });
      });
    } else {
      this.getAnnotation();
    }
  };

  getExistingPredicateId = (property) => {
    if (this.props.properties.allIds.length > 0) {
      let p = this.props.properties.allIds.filter(
        (pId) => (this.props.properties.byId[pId].label === property.label),
      );
      if (p.length > 0) { // Property Already exists 
        return p[0];
      }
    }
    return false;
  }

  getExistingRange = (range) => {
    if (this.props.properties.allIds.length > 0) {
      let p = this.props.properties.allIds.filter(
        (pId) => (this.props.properties.byId[pId].label === range.class.label),
      );
      if (p.length > 0) { // Property Already exists 
        // Check value
        let v = this.props.properties.byId[p[0]].valueIds.filter((id) => {
          if (this.props.values.byId[id].label === range.text) {
            return id;
          } else {
            return false;
          }
        })
        if (v.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  handleNextClick = () => {
    //TODO: add the annotated words as statements for the next step
    let classesID = {};
    let createdProperties = {};
    let statements = { properties: [], values: [] };
    let rangesArray = toArray(this.props.ranges).filter(
      (r) => r.certainty >= this.state.certaintyThreshold,
    );
    if (rangesArray.length > 0) {
      rangesArray.map((range) => {
        let propertyId;
        if (!this.getExistingRange(range) && range.class.id) {
          if (classesID[range.class.id]) {
            propertyId = classesID[range.class.id];
          } else {
            let pID = guid();
            classesID[range.class.id] = pID;
            propertyId = pID;
          }
          if (!createdProperties[propertyId]) {
            let existingPredicateId = this.getExistingPredicateId(range.class);
            if (!existingPredicateId) {
              statements['properties'].push({
                propertyId: propertyId,
                existingPredicateId: (range.class.id.toLowerCase() !== range.class.label.toLowerCase()) ? range.class.id : null,
                label: range.class.label,
              });
            } else {
              propertyId = existingPredicateId
            }
            createdProperties[propertyId] = propertyId;
          }
          statements['values'].push({
            label: range.text,
            type: 'object',
            propertyId: propertyId,
          });
        }
        return null;
      });
    }

    // Add the statements to the selected contribution
    this.props.prefillStatements({ statements, resourceId: this.props.contributions.byId[this.props.selectedContribution].resourceId });

    //TODO: add the annotated words as statements in a specific contribution
    this.props.toggleAbstractDialog();
  };

  handleChangeAbstract = () => {
    if (this.props.abstractDialogView === 'input') {
      if (this.props.abstract.replace(/^\s+|\s+$/g, '') === '' || this.props.abstract.replace(/^\s+|\s+$/g, '').split(' ').length <= 1) {
        this.setState({ validation: false });
        return;
      }
      this.getAnnotation();
    }
    this.props.setAbstractDialogView(this.props.abstractDialogView === 'input' ? 'annotator' : 'input')
    this.setState({ validation: true });
  };

  handleChangeCertaintyThreshold = (values) => {
    this.setState({ certaintyThreshold: values })
  };

  handleChangeClassOptions = (options) => {
    this.setState({ classOptions: options });
  };


  handleViewListAnnotation = () => {
    this.props.setAbstractDialogView('list');
  };

  render() {
    let rangeArray = toArray(this.props.ranges).filter(
      (r) => (r.certainty >= this.state.certaintyThreshold)
    );
    let rangesClasses = [...new Set(rangeArray.map((r) => r.class.label))];
    return (
      <Modal isOpen={this.props.showAbstractDialog} toggle={this.props.toggleAbstractDialog} size="lg">
        <ModalHeader toggle={this.props.toggleAbstractDialog}>Abstract annotation</ModalHeader>
        <ModalBody>
          <div className={'clearfix'}>
            {this.props.abstract &&
              this.props.abstractDialogView === 'annotator' &&
              !this.state.isAnnotationLoading &&
              !this.state.isAnnotationFailedLoading && (
                <div>
                  {rangesClasses.length > 0 && (
                    <Alert color="info">
                      <strong>Info:</strong> we automatically annotated the abstract for you. Please remove
                      any incorrect annotations
                    </Alert>
                  )}
                  {rangesClasses.length === 0 && (
                    <Alert color="info">
                      <strong>Info:</strong> we could not find any concepts on the abstract. Please insert more text in the abstract.
                    </Alert>
                  )}
                </div>
              )}

            {this.props.abstractDialogView === 'annotator' && !this.state.isAnnotationLoading && this.state.isAnnotationFailedLoading && (
              <Alert color="light">
                {this.state.annotationError ? this.state.annotationError : 'Failed to connect to the annotation service, please try again later'}
              </Alert>
            )}

            {this.props.abstractDialogView === 'input' && !this.state.isAbstractLoading && this.state.isAbstractFailedLoading && (
              <Alert color="light">
                We couldn't fetch the abstract of the paper, please enter it manually or skip this step.
              </Alert>
            )}

            <div>
              <div>
                {(this.state.isAbstractLoading || this.state.isAnnotationLoading) && (
                  <div className="text-center text-primary">
                    <span style={{ fontSize: 80 }}>
                      <Icon icon={faSpinner} spin />
                    </span>
                    <br />
                    <h2 className="h5">{this.state.isAbstractLoading ? 'Loading abstract...' : 'Loading annotations...'}</h2>
                  </div>
                )}


                {this.props.abstractDialogView === 'annotator' ? (
                  <AbstractAnnotatorView
                    certaintyThreshold={this.state.certaintyThreshold}
                    isAbstractLoading={this.state.isAbstractLoading}
                    isAnnotationLoading={this.state.isAnnotationLoading}
                    isAnnotationFailedLoading={this.state.isAnnotationFailedLoading}
                    handleChangeCertaintyThreshold={this.handleChangeCertaintyThreshold}
                    classOptions={this.state.classOptions}
                    handleChangeClassOptions={this.handleChangeClassOptions}
                  />
                ) : (
                    <AbstractInputView validation={this.state.validation} classOptions={this.state.classOptions} />
                  )}
              </div>
            </div>

          </div>
          <hr className="mt-5 mb-3" />


          {this.props.abstractDialogView === 'input' ? (
            <>
              <Button color="primary" className="float-right mb-4" onClick={this.handleChangeAbstract}>
                Annotate Abstract
              </Button>
            </>
          ) : (
              <>
                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>
                  Insert Data
                </Button>

                <Button color="light" className="float-right mb-4 mr-2" onClick={this.handleChangeAbstract}>
                  Change abstract
                </Button>
              </>
            )
          }
        </ModalBody>
      </Modal >
    );
  }
}

Abstract.propTypes = {
  nextStep: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  updateAbstract: PropTypes.func.isRequired,
  abstract: PropTypes.string.isRequired,
  ranges: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  doi: PropTypes.string,
  selectedContribution: PropTypes.string.isRequired,
  contributions: PropTypes.object.isRequired,
  createContribution: PropTypes.func.isRequired,
  prefillStatements: PropTypes.func.isRequired,
  createAnnotation: PropTypes.func.isRequired,
  clearAnnotations: PropTypes.func.isRequired,
  resources: PropTypes.object.isRequired,
  properties: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  showAbstractDialog: PropTypes.bool.isRequired,
  toggleAbstractDialog: PropTypes.func.isRequired,
  setAbstractDialogView: PropTypes.func.isRequired,
  abstractDialogView: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  selectedContribution: state.addPaper.selectedContribution,
  title: state.addPaper.title,
  doi: state.addPaper.doi,
  abstract: state.addPaper.abstract,
  ranges: state.addPaper.ranges,
  contributions: state.addPaper.contributions,
  resources: state.statementBrowser.resources,
  properties: state.statementBrowser.properties,
  values: state.statementBrowser.values,
  showAbstractDialog: state.addPaper.showAbstractDialog,
  abstractDialogView: state.addPaper.abstractDialogView,
});

const mapDispatchToProps = (dispatch) => ({
  updateAbstract: (data) => dispatch(updateAbstract(data)),
  nextStep: () => dispatch(nextStep()),
  previousStep: () => dispatch(previousStep()),
  createContribution: (data) => dispatch(createContribution(data)),
  prefillStatements: (data) => dispatch(prefillStatements(data)),
  createAnnotation: (data) => dispatch(createAnnotation(data)),
  clearAnnotations: () => dispatch(clearAnnotations()),
  toggleAbstractDialog: () => dispatch(toggleAbstractDialog()),
  setAbstractDialogView: (data) => dispatch(setAbstractDialogView(data)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )
)(Abstract);
