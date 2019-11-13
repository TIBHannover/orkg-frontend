import React, { Component } from 'react';
import { Button, Alert, Label, Badge, FormFeedback, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { semanticScholarUrl, submitGetRequest, getAnnotations, createPredicate, predicatesUrl } from '../../../network';
import { connect } from 'react-redux';
import {
  updateAbstract, nextStep, previousStep, createContribution, prefillStatements, createAnnotation, clearAnnotations,
  toggleAbstractDialog, setAbstractDialogView
} from '../../../actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import AbstractAnnotator from './AbstractAnnotator';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import Tooltip from '../../Utils/Tooltip';
import { compose } from 'redux';
import { guid } from '../../../utils';
import { withTheme } from 'styled-components';
import { Range, getTrackBackground } from 'react-range';
import toArray from 'lodash/toArray';
import randomcolor from 'randomcolor';
import capitalize from 'capitalize';
import Tippy from '@tippy.js/react';


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
      classColors: {
        'process': '#7fa2ff',
        'data': '	#9df28a',
        'material': '#EAB0A2',
        'method': '#D2B8E5',
      },
      certaintyThreshold: [0.5],
      validation: true,
    };

    this.automaticAnnotationConcepts = [
      { label: 'Process', description: 'Natural phenomenon, or independent/dependent activities.E.g., growing(Bio), cured(MS), flooding(ES).' },
      { label: 'Data', description: 'The data themselves, or quantitative or qualitative characteristics of entities. E.g., rotational energy (Eng), tensile strength (MS), the Chern character (Mat).' },
      { label: 'Material', description: 'A physical or digital entity used for scientific experiments. E.g., soil (Agr), the moon (Ast), the set (Mat).' },
      { label: 'Method', description: 'A commonly used procedure that acts on entities. E.g., powder X-ray (Che), the PRAM analysis (CS), magnetoencephalography (Med).' }
    ];
  }

  componentDidMount() {
    this.loadClassOptions();
    this.fetchAbstract();
  }

  loadClassOptions = () => {
    // Fetch the predicates used in the NLP model
    let nLPPredicates = this.automaticAnnotationConcepts.map((classOption) => {
      return submitGetRequest(predicatesUrl + '?q=' + classOption.label + '&exact=true').then(predicates => {
        if (predicates.length > 0) {
          return predicates[0]; // Use the first predicate that match the label
        } else {
          return createPredicate(classOption.label) // Create the predicate if it doesn't exist
        }
      })
    })
    let options = [];
    Promise.all(nLPPredicates).then((results) => {
      results.map((item) =>
        options.push({
          label: item.label,
          id: item.id,
        }),
      );
    })
    this.setState({ classOptions: options });
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


  handleViewListAnnotation = () => {
    this.props.setAbstractDialogView('list');
  };


  handleChange = (event) => {
    this.props.updateAbstract(event.target.value);
  };

  stripLineBreaks = (event) => {
    event.preventDefault();
    var text = '';
    if (event.clipboardData || event.originalEvent.clipboardData) {
      text = (event.originalEvent || event).clipboardData.getData('text/plain');
    } else if (window.clipboardData) {
      text = window.clipboardData.getData('Text');
    }
    // strip line breaks
    text = text.replace(/\r?\n|\r/g, ' ')
    this.props.updateAbstract(text);
  };

  getClassColor = (rangeClass) => {
    if (!rangeClass) {
      return '#ffb7b7';
    }
    if (this.state.classColors[rangeClass.toLowerCase()]) {
      return this.state.classColors[rangeClass.toLowerCase()];
    } else {
      let newColor = randomcolor({ luminosity: 'light', seed: rangeClass.toLowerCase() });
      this.setState({ classColors: { ...this.state.classColors, [rangeClass.toLowerCase()]: newColor } });
      return newColor;
    }
  }

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
                  <div className="pl-2 pr-2">
                    {!this.state.isAbstractLoading && !this.state.isAnnotationLoading && (
                      <div>

                        <div id="annotationBadges">
                          <Tooltip className={'mr-2'} message="Annotation labels are the properties that will be used in the contribution data.">
                            Annotation labels
                          </Tooltip>
                          <span className={'mr-1 ml-1'} />
                          {rangesClasses.length > 0 &&
                            rangesClasses.map((c) => {
                              let aconcept = c ? this.automaticAnnotationConcepts.filter(function (e) { return e.label.toLowerCase() === c.toLowerCase(); }) : []
                              if (c && aconcept.length > 0) {
                                return (
                                  <Tippy key={`c${c}`} hideDefaultIcon={true} content={aconcept[0].description}>
                                    <span>
                                      <Badge
                                        className={'mr-2'}
                                        style={{ cursor: 'pointer', marginBottom: '4px', color: '#333', background: this.getClassColor(c) }}
                                      >
                                        {c ? capitalize(c) : 'Unlabeled'} <Badge pill color="secondary">{rangeArray.filter((rc) => rc.class.label === c).length}</Badge>
                                      </Badge>
                                    </span>
                                  </Tippy>
                                );
                              } else {
                                return (
                                  <Badge
                                    className={'mr-2'}
                                    key={`c${c}`}
                                    style={{ marginBottom: '4px', color: '#333', background: this.getClassColor(c) }}
                                  >
                                    {c ? capitalize(c) : 'Unlabeled'} <Badge pill color="secondary">{rangeArray.filter((rc) => rc.class.label === c).length}</Badge>
                                  </Badge>
                                );
                              }
                            })}
                        </div>
                        <AbstractAnnotator
                          certaintyThreshold={this.state.certaintyThreshold[0]}
                          classOptions={this.state.classOptions}
                          getClassColor={this.getClassColor}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                    <div>
                      <Label for="paperAbstract">
                        <Tooltip message="Enter the paper abstract to get automatically generated concepts for you paper.">
                          Enter the paper abstract
                        </Tooltip>
                      </Label>
                      <Textarea
                        id="paperAbstract"
                        className={`form-control pl-2 pr-2 ${!this.state.validation ? 'is-invalid' : ''}`}
                        minRows={5}
                        value={this.props.abstract}
                        onChange={this.handleChange}
                        onPaste={this.stripLineBreaks}
                      />
                      {!this.state.validation &&
                        <FormFeedback className="order-1">
                          Please enter the abstract or skip this step.
                        </FormFeedback>
                      }
                    </div>
                  )}
              </div>
            </div>

            {this.props.abstractDialogView === 'annotator' && !this.state.isAbstractLoading && !this.state.isAnnotationLoading &&
              !this.state.isAnnotationFailedLoading && toArray(this.props.ranges).length > 0 && (
                <div className={'col-3 float-right'}>
                  <div className={'mt-4'}>
                    <Range
                      step={0.025}
                      min={0}
                      max={1}
                      values={this.state.certaintyThreshold}
                      onChange={(values) => this.setState({ certaintyThreshold: values })}
                      renderTrack={({ props, children }) => (
                        <div
                          {...props}
                          style={{
                            ...props.style,
                            height: '6px',
                            width: '100%',
                            background: getTrackBackground({
                              values: this.state.certaintyThreshold,
                              colors: [
                                this.props.theme.orkgPrimaryColor,
                                this.props.theme.ultraLightBlueDarker,
                              ],
                              min: 0,
                              max: 1,
                            }),
                          }}
                        >
                          {children}
                        </div>
                      )}
                      renderThumb={({ props }) => (
                        <div
                          {...props}
                          style={{
                            ...props.style,
                            height: '20px',
                            width: '20px',
                            borderRadius: '4px',
                            backgroundColor: '#FFF',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0px 2px 6px #AAA',
                          }}
                        />
                      )}
                    />
                    <div className={'mt-2 text-center'}>
                      <span className={'mr-2'}>Certainty {this.state.certaintyThreshold[0].toFixed(2)}</span>
                      <Tooltip trigger={'click'} hideDefaultIcon={true} message="Here you can adjust the certainty value, that means at which level you accept the confidence ratio of automatic annotations. Only the shown annotations will be used to create the contribution data in the next step.">
                        <Icon style={{ cursor: 'pointer' }} className={'text-primary'} icon={faQuestionCircle} />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )}
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
  theme: PropTypes.object.isRequired,
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
  ),
  withTheme
)(Abstract);
