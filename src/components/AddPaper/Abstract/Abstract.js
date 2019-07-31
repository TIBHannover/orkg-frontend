import React, { Component } from 'react';
import { Button, Alert, Card, CardBody, Label, Badge } from 'reactstrap';
import { arxivUrl } from '../../../network';
import { connect } from 'react-redux';
import { updateAbstract, nextStep, previousStep } from '../../../actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import AbstractAnnotator from './AbstractAnnotator';
import { getAnnotations } from '../../../network';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import Tooltip from '../../Utils/Tooltip';

class Annotation extends Component {
  constructor(props) {
    super(props);

    this.highlightableRef = React.createRef();

    this.state = {
      isAnnotationLoading: false,
      classeOptions: [
        { value: 'process', label: 'Process' },
        { value: 'data', label: 'Data' },
        { value: 'material', label: 'Material' },
        { value: 'method', label: 'Method' },
      ],
      isLoading: false,
      showError: false,
      changeAbstract: false,
      loading: false,
      ranges: [],
      idIndex: 1,
      toolTips: {},
      rangeClasses: {},
      tooltipOpen: false,
    };
  }

  componentDidMount() {
    this.fetchAbstract();
  }

  componentDidUpdate = (prevProps, prevState) => {
    /*
    if (
      JSON.stringify(this.state.toolTips) !== JSON.stringify(prevState.toolTips) ||
      JSON.stringify(this.state.rangeClasses) !== JSON.stringify(prevState.rangeClasses)
    ) {
      //this.highlightableRef.current.forceUpdate();
    }*/
  };

  getAnnotation = () => {
    this.setState({ isAnnotationLoading: true });
    return getAnnotations(this.props.abstract)
      .catch((error) => {
        this.setState({ isAnnotationLoading: false });
      })
      .then((data) => {
        let rangeClasses = {};
        let annotated = [];
        let ranges = [];
        if (data.entities) {
          ranges = data.entities
            .map((entity) => {
              let text = data.text.substring(entity[2][0][0], entity[2][0][1]);
              rangeClasses[entity[0]] = entity[1];
              if (annotated.indexOf(text.toLowerCase()) < 0) {
                annotated.push(text.toLowerCase());
                return {
                  id: entity[0],
                  text: text,
                  start: entity[2][0][0],
                  end: entity[2][0][1],
                };
              } else {
                return null;
              }
            })
            .filter((r) => r);
        }
        this.setState({ rangeClasses, ranges, isAnnotationLoading: false });
      });
  };

  handleChangeAnnotationClass = (selectedOption, { action }, range) => {
    if (action !== 'clear') {
      this.setState({
        rangeClasses: { ...this.state.rangeClasses, [range.id]: selectedOption.label },
      });
    } else {
      this.removeAnnotation(range);
    }
  };

  removeAnnotation = (range) => {
    var filtered = this.state.ranges.filter(function(value, index, arr) {
      return value.id !== range.id;
    });
    let t = this.state.toolTips;
    delete t[range.id];
    let r = this.state.rangeClasses;
    delete r[range.id];
    this.setState({ ranges: filtered, toolTips: t, rangeClasses: r });
  };

  handleCreateClass = (inputValue, range) => {
    const newOption = {
      label: inputValue,
      value: inputValue,
    };
    this.setState({
      classeOptions: [...this.state.classeOptions, newOption],
      rangeClasses: { ...this.state.rangeClasses, [range.id]: inputValue },
    });
  };

  onCreateAnnotation = (range) => {
    this.setState({
      idIndex: this.state.idIndex + 1,
      ranges: [...this.state.ranges, range],
      toolTips: { ...this.state.toolTips, [range.id]: false },
      rangeClasses: { ...this.state.rangeClasses, [range.id]: this.state.classeOptions[0].label },
    });
  };

  toggleTooltip = (range) => {
    this.setState({
      toolTips: { ...this.state.toolTips, [range.id]: !this.state.toolTips[range.id] },
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

      const titleEncoded = encodeURIComponent(this.props.title).replace(/%20/g, '+');
      const apiCall = arxivUrl + '?search_query=ti:' + titleEncoded;

      fetch(apiCall, { method: 'GET' })
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
        .then((abstract) => {
          // remove line breaks from the abstract
          abstract = abstract.replace(/(\r\n|\n|\r)/gm, ' ');

          this.setState({
            loading: false,
          });
          this.props.updateAbstract(abstract);
          this.getAnnotation();
        })
        .catch();
    } else {
      this.getAnnotation();
    }
  };

  handleNextClick = () => {
    //TODO: add the annotated words as statements for the next step
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
    return (
      <div>
        <h2 className="h4 mt-4 mb-3">Abstract annotation</h2>

        {this.props.abstract && !this.state.changeAbstract && (
          <Alert color="info">
            <strong>Info:</strong> we automatically annotated the abstract for you. Please remove
            any incorrect annotations
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
                    {this.state.rangeClasses &&
                      this.state.classeOptions.map((c) => {
                        let color = '#0052CC';
                        switch (c.label) {
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
                            color = '#0052CC';
                        }
                        //
                        return (
                          <Badge key={c.label} style={{ background: color }}>
                            {c.label}{' '}
                            {
                              Object.values(this.state.rangeClasses).filter((rc) => rc === c.label)
                                .length
                            }
                          </Badge>
                        );
                      })}
                    <AbstractAnnotator
                      ranges={this.state.ranges}
                      abstract={this.props.abstract}
                      rangesIdIndex={this.state.idIndex}
                      toolTips={this.state.toolTips}
                      annotationClasseOptions={this.state.classeOptions}
                      annotationClasses={this.state.rangeClasses}
                      handleCreateClass={this.handleCreateClass}
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
                  <Tooltip message="Enter the paper abstract to get automatically generated concepts for you paper. You can skip this step by clicking the 'Next step' button">
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

Annotation.propTypes = {
  nextStep: PropTypes.func.isRequired,
  previousStep: PropTypes.func.isRequired,
  updateAbstract: PropTypes.func.isRequired,
  abstract: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  selectedResearchField: state.addPaper.selectedResearchField,
  title: state.addPaper.title,
  abstract: state.addPaper.abstract,
});

const mapDispatchToProps = (dispatch) => ({
  updateAbstract: (data) => dispatch(updateAbstract(data)),
  nextStep: () => dispatch(nextStep()),
  previousStep: () => dispatch(previousStep()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Annotation);
