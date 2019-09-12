import React, { Component } from 'react';
import { Button, Alert, Card, CardBody, Label, Badge, FormFeedback } from 'reactstrap';
import { semanticScholarUrl, submitGetRequest, getAnnotations, createPredicate, predicatesUrl } from '../../../network';
import { connect } from 'react-redux';
import {
  updateAbstract,
  nextStep,
  previousStep,
  createContribution,
  prefillStatements,
  createAnnotation,
  clearAnnotations,
  openTour, closeTour, updateTourCurrentStep
} from '../../../actions/addPaper';
import { withCookies, Cookies } from 'react-cookie';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import AbstractAnnotator from './AbstractAnnotator';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import Tooltip from '../../Utils/Tooltip';
import { compose } from 'redux';
import { guid } from '../../../utils';
import { withTheme } from 'styled-components';
import { Range, getTrackBackground } from 'react-range';
import Tour from 'reactour';
import toArray from 'lodash/toArray';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import randomcolor from 'randomcolor';
import capitalize from 'capitalize';


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
      changeAbstract: false,
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

    // check if a cookie of take a tour exist 
    if (this.props.cookies && this.props.cookies.get('taketour') === 'take' && this.props.tourCurrentStep === 1
      && !this.props.cookies.get('showedAbstract')) {
      this.props.openTour(0);
      this.props.cookies.set('showedAbstract', true, { path: '/', maxAge: 3600000 });
    }
  }

  componentDidMount() {
    this.loadClassOptions();
    this.fetchAbstract();
  }

  componentWillUnmount() {
    clearAllBodyScrollLocks();
  }

  disableBody = target => disableBodyScroll(target)
  enableBody = target => enableBodyScroll(target)

  loadClassOptions = () => {
    // Fetch the predicates used in the NLP model
    let classeOptions = ['Process', 'Data', 'Material', 'Method'];
    let nLPPredicates = classeOptions.map((classOption) => {
      return submitGetRequest(predicatesUrl + '?q=' + classOption + '&exact=true').then(predicates => {
        if (predicates.length > 0) {
          return predicates[0]; // Use the first predicate that match the label
        } else {
          return createPredicate(classOption) // Create the predicate if it doesn't exist
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
        this.setState({
          changeAbstract: true,
        });
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
    if (this.props.contributions.allIds.length === 0) {
      this.props.createContribution({
        selectAfterCreation: true,
        prefillStatements: true,
        statements: statements,
      });
    } else {
      // Add the statements to the first contribution
      this.props.prefillStatements({ statements, resourceId: this.props.contributions.byId[this.props.contributions.allIds[0]].resourceId });
    }
    //TODO: add the annotated words as statements in a specific contribution

    this.props.nextStep();
  };

  handleChangeAbstract = () => {
    if (this.state.changeAbstract) {
      if (this.props.abstract.replace(/^\s+|\s+$/g, '') === '' || this.props.abstract.replace(/^\s+|\s+$/g, '').split(' ').length <= 1) {
        this.setState({ validation: false });
        return;
      }
      this.getAnnotation();
    }
    this.setState((prevState) => ({
      changeAbstract: !prevState.changeAbstract,
      validation: true
    }));
  };

  handleChange = (event) => {
    this.props.updateAbstract(event.target.value);
  };

  requestCloseTour = () => {
    this.enableBody();
    if (this.props.cookies.get('taketourClosed')) {
      this.props.closeTour();
    } else {
      this.setState({ isClosed: true });
    }
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
      <div>
        <h2 className="h4 mt-4 mb-3 clearfix">Abstract annotation
        <Button id="skipStepButton" outline color="primary" className="float-right" onClick={this.props.nextStep}>
            Skip this step
        </Button>
        </h2>

        {this.props.abstract &&
          !this.state.changeAbstract &&
          !this.state.isAnnotationLoading &&
          !this.state.isAnnotationFailedLoading && (
            <div>
              {rangesClasses.length > 0 &&
                <Alert color="info">
                  <strong>Info:</strong> we automatically annotated the abstract for you. Please remove
                  any incorrect annotations
                </Alert>}
              {rangesClasses.length === 0 &&
                <Alert color="info">
                  <strong>Info:</strong> we could not find any concepts on the abstract. Please insert more text in the abstract.
                </Alert>}
            </div>
          )}

        {!this.state.changeAbstract && !this.state.isAnnotationLoading && this.state.isAnnotationFailedLoading && (
          <Alert color="light">
            {this.state.annotationError ? this.state.annotationError : 'Failed to connect to the annotation service, please try again later'}
          </Alert>
        )}

        {this.state.changeAbstract && !this.state.isAbstractLoading && this.state.isAbstractFailedLoading && (
          <Alert color="light">
            We couldn't fetch the abstract of the paper, please enter it manually or skip this step.
          </Alert>
        )}

        <Card>
          <CardBody>
            {(this.state.isAbstractLoading || this.state.isAnnotationLoading) && (
              <div className="text-center text-primary">
                <span style={{ fontSize: 80 }}>
                  <Icon icon={faSpinner} spin />
                </span>
                <br />
                <h2 className="h5">{this.state.isAbstractLoading ? 'Loading abstract...' : 'Loading annotations...'}</h2>
              </div>
            )}


            {!this.state.changeAbstract ? (
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
                          return (
                            <Badge
                              className={'mr-2'}
                              key={`c${c}`}
                              style={{ marginBottom: '4px', color: '#333', background: this.getClassColor(c) }}
                            >
                              {c ? capitalize(c) : 'Unlabeled'} <Badge pill color="secondary">{rangeArray.filter((rc) => rc.class.label === c).length}</Badge>
                            </Badge>
                          );
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
                  />
                  {!this.state.validation &&
                    <FormFeedback className="order-1">
                      Please enter the abstract or skip this step.
                    </FormFeedback>
                  }
                  <Tour
                    onAfterOpen={this.disableBody}
                    onBeforeClose={this.enableBody}
                    steps={[
                      {
                        selector: '#paperAbstract',
                        content: ({ goTo }) => (
                          <div>
                            Enter the paper abstract to get automatically generated concepts for you paper.
                          </div>
                        ),
                        style: { borderTop: '4px solid #E86161' },
                        position: 'right',
                      }
                    ]}
                    showNumber={false}
                    accentColor={this.props.theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={this.requestCloseTour}
                    isOpen={this.props.isTourOpen}
                    startAt={0}
                    getCurrentStep={curr => { this.props.updateTourCurrentStep(curr); }}
                    showButtons={false}
                    showNavigation={false}
                    maskClassName="reactourMask"
                  />
                </div>
              )}
          </CardBody>
        </Card>

        <Button color="light" className="mb-2 mt-2" onClick={this.handleChangeAbstract}>
          {this.state.changeAbstract ? 'Annotate abstract' : 'Change abstract'}
        </Button>
        {!this.state.changeAbstract && !this.state.isAbstractLoading && !this.state.isAnnotationLoading &&
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
                  <Tooltip message="Here you can adjust the certainty value, that means at which level you accept the confidence ratio of automatic annotations. Only the shown annotations will be used to create the contribution data in the next step.">
                    Certainty {this.state.certaintyThreshold[0].toFixed(2)}
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

        <hr className="mt-5 mb-3" />

        <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>
          Next step
        </Button>
        <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>
          Previous step
        </Button>
      </div>
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
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  openTour: PropTypes.func.isRequired,
  closeTour: PropTypes.func.isRequired,
  updateTourCurrentStep: PropTypes.func.isRequired,
  isTourOpen: PropTypes.bool.isRequired,
  tourCurrentStep: PropTypes.number.isRequired,
  tourStartAt: PropTypes.number.isRequired,
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
  isTourOpen: state.addPaper.isTourOpen,
  tourCurrentStep: state.addPaper.tourCurrentStep,
  tourStartAt: state.addPaper.tourStartAt,
});

const mapDispatchToProps = (dispatch) => ({
  updateAbstract: (data) => dispatch(updateAbstract(data)),
  nextStep: () => dispatch(nextStep()),
  previousStep: () => dispatch(previousStep()),
  createContribution: (data) => dispatch(createContribution(data)),
  prefillStatements: (data) => dispatch(prefillStatements(data)),
  createAnnotation: (data) => dispatch(createAnnotation(data)),
  clearAnnotations: () => dispatch(clearAnnotations()),
  updateTourCurrentStep: (data) => dispatch(updateTourCurrentStep(data)),
  openTour: (data) => dispatch(openTour(data)),
  closeTour: () => dispatch(closeTour()),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withTheme,
  withCookies
)(Abstract);
