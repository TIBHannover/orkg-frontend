import React, { Component } from 'react';
import { Button, Alert, Card, CardBody, Label, Badge } from 'reactstrap';
import { arxivUrl, semanticScholarUrl, submitGetRequest, getAnnotations } from '../../../network';
import { connect } from 'react-redux';
import {
  updateAbstract,
  nextStep,
  previousStep,
  createContribution,
  prefillStatements
} from '../../../actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import AbstractAnnotator from './AbstractAnnotator';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import Tooltip from '../../Utils/Tooltip';
import dotProp from 'dot-prop-immutable';
import { compose } from 'redux';
import { guid } from '../../../utils';
import { withTheme } from 'styled-components';
import { Range, getTrackBackground } from 'react-range';
import toArray from 'lodash/toArray';

class Abstract extends Component {
  constructor(props) {
    super(props);

    this.highlightableRef = React.createRef();

    this.state = {
      isAnnotationLoading: false,
      isAnnotationFailedLoading: false,
      isAbstractFailedLoading:false,
      classeOptions: [
        { id: 'process', label: 'Process' },
        { id: 'data', label: 'Data' },
        { id: 'material', label: 'Material' },
        { id: 'method', label: 'Method' },
      ],
      isLoading: false,
      showError: false,
      changeAbstract: false,
      loading: false,
      ranges: {},
      idIndex: 1,
      uncertaintyThreshold: [0.8],
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
                ranges[entity[0]] = {
                  id: entity[0],
                  text: text,
                  start: entity[2][0][0],
                  end: entity[2][0][1] - 1,
                  uncertainty: entity[3],
                  class: { id: entity[1], label: entity[1] },
                };
                return ranges[entity[0]];
              } else {
                return null;
              }
            })
            .filter((r) => r);
        }
        this.setState({
          ranges: ranges,
          isAnnotationLoading: false,
          isSimilaireContributionsLoading: true,
        });
      })
      .catch(() => {
        this.setState({ isAnnotationLoading: false, isAnnotationFailedLoading: true });
        return null;
      });
  };

  handleChangeAnnotationClass = (selectedOption, { action }, range) => {
    if (action === 'select-option') {
      let state = dotProp.set(this.state, `ranges.${[range.id]}.class`, {
        id: selectedOption.id,
        label: selectedOption.label,
      });
      this.setState(state);
    } else if (action === 'create-option') {
      const newOption = {
        label: selectedOption.label,
        id: selectedOption.label,
      };
      let state = dotProp.set(this.state, `ranges.${[range.id]}.class`, {
        id: selectedOption.id,
        label: selectedOption.label,
      });
      this.setState(state);
      this.setState({ classeOptions: [...this.state.classeOptions, newOption] });
    } else if (action === 'clear') {
      this.removeAnnotation(range);
    }
  };

  removeAnnotation = (range) => {
    let filtered = this.state.ranges;
    delete filtered[range.id];
    this.setState({ ranges: filtered });
  };

  onCreateAnnotation = (range) => {
    this.setState({
      idIndex: this.state.idIndex + 1,
      ranges: { ...this.state.ranges, [range.id]: range },
    });
  };

  fetchAbstract = async () => {
    if (!this.props.abstract) {
      if (!this.props.title) {
        this.setState({
          changeAbstract: true,
        });
        return;
      }
      this.setState({
        loading: true,
      });

      let DOI = this.props.doi.substring(this.props.doi.indexOf('10.'));
      return submitGetRequest(semanticScholarUrl+DOI).then((data, reject)=>{
        if(!data.abstract){
          return reject;
        }
        return data.abstract;
      }).catch(()=>{
        const titleEncoded = encodeURIComponent(this.props.title).replace(/%20/g, '+');
        const apiCall = arxivUrl + '?search_query=ti:' + titleEncoded;
        return fetch(apiCall, { method: 'GET' })
          .then((response) => response.text())
          .then((str) => new window.DOMParser().parseFromString(str, 'text/xml')) // parse the text as xml
          .then((xmlDoc) => {
            // get the abstract from the xml doc
            if (xmlDoc.getElementsByTagName('entry') && xmlDoc.getElementsByTagName('entry')[0]) {
              return xmlDoc.getElementsByTagName('entry')[0].getElementsByTagName('summary')[0]
                .innerHTML;
            }
            return '';
          })
      }).then((abstract) => {
          // remove line breaks from the abstract
          abstract = abstract.replace(/(\r\n|\n|\r)/gm, ' ');
          
          this.setState({
            loading: false,
          });
          this.props.updateAbstract(abstract);
          this.getAnnotation();
        })
        .catch(() => { 
          this.handleChangeAbstract();
          this.setState({ isAbstractFailedLoading: true, loading: false });
        });
    } else {
      this.getAnnotation();
    }
  };

  handleNextClick = () => {
    //TODO: add the annotated words as statements for the next step

    let classesID = {};
    let createdProperties = {};
    let statements = { properties: [], values: [] };
    let rangesIDs = Object.keys(this.state.ranges);
    if (rangesIDs.length > 0) {
      rangesIDs.map((rID) => {
        let range = this.state.ranges[rID];
        let propertyId;
        let predicateId = null;

        if (range.uncertainty <= this.state.uncertaintyThreshold) {
          if (range.class.id !== range.class.label) {
            //existing predicate
            predicateId = range.class.id;
            propertyId = range.class.id;
          } else {
            if (classesID[range.class.id]) {
              propertyId = classesID[range.class.id];
            } else {
              let pID = guid();
              classesID[range.class.id] = pID;
              propertyId = pID;
            }
          }
          if (!createdProperties[propertyId]) {
            statements['properties'].push({
              propertyId: propertyId,
              existingPredicateId: predicateId,
              label: range.class.label,
            });
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
    }else{
      // Add the statements to the first contribution
      this.props.prefillStatements({ statements, resourceId : this.props.contributions.byId[this.props.contributions.allIds[0]].resourceId });
    }

    //TODO: add the annotated words as statements in a specific contribution

    this.props.nextStep();
  };

  handleChangeAbstract = () => {
    if (this.state.changeAbstract) {
      this.getAnnotation();
    }
    this.setState((prevState) => ({
      changeAbstract: !prevState.changeAbstract,
    }));
  };

  handleChange = (event) => {
    this.props.updateAbstract(event.target.value);
  };

  render() {
    let rangeArray = toArray(this.state.ranges).filter(
      (r) => r.uncertainty <= this.state.uncertaintyThreshold,
    );
    let rangesClasses = [...new Set(rangeArray.map((r) => r.class.label))];
    return (
      <div>
        <h2 className="h4 mt-4 mb-3 clearfix">Abstract annotation
        <Button outline color="primary" className="float-right" onClick={this.props.nextStep}>
          Skip this step
        </Button>
        </h2>

        {this.props.abstract &&
          !this.state.changeAbstract &&
          !this.state.isAnnotationFailedLoading && (
            <Alert color="info">
              <strong>Info:</strong> we automatically annotated the abstract for you. Please remove
              any incorrect annotations
            </Alert>
          )}

        {!this.state.isAnnotationLoading && this.state.isAnnotationFailedLoading && (
          <Alert color="light">
            Failed to connect to the annotation service, please try again later
          </Alert>
        )}
        {!this.state.loading && this.state.isAbstractFailedLoading && (
          <Alert color="light">
            We couldn't fetch the abstract of the paper, please enter it manually or skip this step.
          </Alert>
        )}

        <Card>
          <CardBody>
            {this.state.loading && (
              <div className="text-center" style={{ fontSize: 30 }}>
                <Icon icon={faSpinner} spin />
              </div>
            )}

            {!this.state.changeAbstract ? (
              <div className="pl-2 pr-2">
                {this.state.isAnnotationLoading && (
                  <div className="text-center text-primary">
                    <span style={{ fontSize: 80 }}>
                      <Icon icon={faSpinner} spin />
                    </span>
                    <br />
                    <h2 className="h5">Loading annotations...</h2>
                  </div>
                )}

                {!this.state.isAnnotationLoading && (
                  <div>
                    {rangesClasses.length > 0 &&
                      rangesClasses.map((c) => {
                        let color = '#0052CC';
                        switch (c) {
                          case 'Process':
                            color = '#7fa2ff';
                            break;
                          case 'Data':
                            color = '#5FA97F';
                            break;
                          case 'Material':
                            color = '#EAB0A2';
                            break;
                          case 'Method':
                            color = '#D2B8E5';
                            break;
                          default:
                            color = '#ffb7b7';
                        }
                        //
                        return (
                          <Badge
                            className={'mr-2'}
                            key={`c${c}`}
                            style={{ color: '#333', background: color }}
                          >
                            {c ? c : 'Unlabeled'} {rangeArray.filter((rc) => rc.class.label === c).length}
                          </Badge>
                        );
                      })}
                    <AbstractAnnotator
                      ranges={this.state.ranges}
                      abstract={this.props.abstract}
                      rangesIdIndex={this.state.idIndex}
                      uncertaintyThreshold={this.state.uncertaintyThreshold[0]}
                      annotationClasseOptions={this.state.classeOptions}
                      handleChangeAnnotationClass={this.handleChangeAnnotationClass}
                      onCreateAnnotation={this.onCreateAnnotation}
                      toggleTooltip={this.toggleTooltip}
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
                  className="form-control pl-2 pr-2"
                  minRows={5}
                  value={this.props.abstract}
                  onChange={this.handleChange}
                />
              </div>
            )}
          </CardBody>
        </Card>

        <Button color="light" className="mb-2 mt-1" onClick={this.handleChangeAbstract}>
          {this.state.changeAbstract ? 'Annotate abstract' : 'Change abstract'}
        </Button>
        {!this.state.isAnnotationLoading && !this.state.isAnnotationFailedLoading && toArray(this.state.ranges).length > 0 && (
          <div className={'col-3 float-right'}>
            <div className={'mt-4'}>
              <Range
                step={0.025}
                min={0}
                max={1}
                values={this.state.uncertaintyThreshold}
                onChange={(values) => this.setState({ uncertaintyThreshold: values })}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '6px',
                      width: '100%',
                      background: getTrackBackground({
                        values: this.state.uncertaintyThreshold,
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
                Uncertainty {this.state.uncertaintyThreshold[0].toFixed(2)}
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
  title: PropTypes.string.isRequired,
  doi: PropTypes.string,
  selectedContribution: PropTypes.string.isRequired,
  contributions: PropTypes.object.isRequired,
  createContribution: PropTypes.func.isRequired,
  prefillStatements: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  selectedContribution: state.addPaper.selectedContribution,
  title: state.addPaper.title,
  doi: state.addPaper.doi,
  abstract: state.addPaper.abstract,
  contributions: state.addPaper.contributions,
});

const mapDispatchToProps = (dispatch) => ({
  updateAbstract: (data) => dispatch(updateAbstract(data)),
  nextStep: () => dispatch(nextStep()),
  previousStep: () => dispatch(previousStep()),
  createContribution: (data) => dispatch(createContribution(data)),
  prefillStatements: (data) => dispatch(prefillStatements(data)),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  withTheme,
)(Abstract);
