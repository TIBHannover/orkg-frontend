import { Component } from 'react';
import Tooltip from '../../Utils/Tooltip';
import { Badge, Alert } from 'reactstrap';
import capitalize from 'capitalize';
import Tippy from '@tippyjs/react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AbstractAnnotator from './AbstractAnnotator';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { Range, getTrackBackground } from 'react-range';
import { withTheme } from 'styled-components';
import toArray from 'lodash/toArray';
import { compose } from 'redux';

class AbstractAnnotatorView extends Component {
    render() {
        const rangeArray = toArray(this.props.ranges).filter(r => r.certainty >= this.props.certaintyThreshold);
        const rangesClasses = [...new Set(rangeArray.map(r => r.class.label))];
        return (
            <div className="pl-2 pr-2">
                {this.props.abstract && !this.props.isAnnotationLoading && !this.props.isAnnotationFailedLoading && (
                    <div>
                        {rangesClasses.length > 0 && (
                            <Alert color="info">
                                <strong>Info:</strong> we automatically annotated the abstract for you. Please remove any incorrect annotations
                            </Alert>
                        )}
                        {rangesClasses.length === 0 && (
                            <Alert color="info">
                                <strong>Info:</strong> we could not find any concepts on the abstract. Please insert more text in the abstract.
                            </Alert>
                        )}
                    </div>
                )}

                {!this.props.isAnnotationLoading && this.props.isAnnotationFailedLoading && (
                    <Alert color="light">
                        {this.props.annotationError
                            ? this.props.annotationError
                            : 'Failed to connect to the annotation service, please try again later'}
                    </Alert>
                )}
                {!this.props.isAbstractLoading && !this.props.isAnnotationLoading && (
                    <div>
                        <div id="annotationBadges">
                            <Tooltip className="mr-2" message="Annotation labels are the properties that will be used in the contribution data.">
                                Annotation labels
                            </Tooltip>
                            <span className="mr-1 ml-1" />
                            {rangesClasses.length > 0 &&
                                rangesClasses.map(c => {
                                    const aconcept = c
                                        ? this.props.classOptions.filter(function(e) {
                                              return e.label.toLowerCase() === c.toLowerCase();
                                          })
                                        : [];
                                    if (c && aconcept.length > 0) {
                                        return (
                                            <Tippy key={`c${c}`} content={aconcept[0].description}>
                                                <span>
                                                    <Badge
                                                        className="mr-2"
                                                        style={{
                                                            cursor: 'pointer',
                                                            marginBottom: '4px',
                                                            color: '#333',
                                                            background: this.props.getClassColor(c)
                                                        }}
                                                    >
                                                        {c ? capitalize(c) : 'Unlabeled'}{' '}
                                                        <Badge pill color="secondary">
                                                            {rangeArray.filter(rc => rc.class.label === c).length}
                                                        </Badge>
                                                    </Badge>
                                                </span>
                                            </Tippy>
                                        );
                                    } else {
                                        return (
                                            <Badge
                                                className="mr-2"
                                                key={`c${c}`}
                                                style={{ marginBottom: '4px', color: '#333', background: this.props.getClassColor(c) }}
                                            >
                                                {c ? capitalize(c) : 'Unlabeled'}{' '}
                                                <Badge pill color="secondary">
                                                    {rangeArray.filter(rc => rc.class.label === c).length}
                                                </Badge>
                                            </Badge>
                                        );
                                    }
                                })}
                        </div>
                        <AbstractAnnotator
                            certaintyThreshold={this.props.certaintyThreshold[0]}
                            classOptions={this.props.classOptions}
                            getClassColor={this.props.getClassColor}
                        />
                    </div>
                )}
                {!this.props.isAbstractLoading &&
                    !this.props.isAnnotationLoading &&
                    !this.props.isAnnotationFailedLoading &&
                    toArray(this.props.ranges).length > 0 && (
                        <div className="col-3 float-right">
                            <div className="mt-4">
                                <Range
                                    step={0.025}
                                    min={0}
                                    max={1}
                                    values={this.props.certaintyThreshold}
                                    onChange={values => this.props.handleChangeCertaintyThreshold(values)}
                                    renderTrack={({ props, children }) => (
                                        <div
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: '6px',
                                                width: '100%',
                                                background: getTrackBackground({
                                                    values: this.props.certaintyThreshold,
                                                    colors: [this.props.theme.smart, this.props.theme.lightDarker],
                                                    min: 0,
                                                    max: 1
                                                })
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
                                                boxShadow: '0px 2px 6px #AAA'
                                            }}
                                        />
                                    )}
                                />
                                <div className="mt-2 text-center">
                                    <span className="mr-2">Certainty {this.props.certaintyThreshold[0].toFixed(2)}</span>
                                    <Tooltip
                                        trigger="click"
                                        hideDefaultIcon={true}
                                        message="Here you can adjust the certainty value, that means at which level you accept the confidence ratio of automatic annotations. Only the shown annotations will be used to create the contribution data in the next step."
                                    >
                                        <Icon style={{ cursor: 'pointer' }} className="text-smart" icon={faQuestionCircle} />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}

AbstractAnnotatorView.propTypes = {
    abstract: PropTypes.string.isRequired,
    ranges: PropTypes.object.isRequired,
    certaintyThreshold: PropTypes.array.isRequired,
    classOptions: PropTypes.array.isRequired,
    isAbstractLoading: PropTypes.bool.isRequired,
    isAnnotationLoading: PropTypes.bool.isRequired,
    isAnnotationFailedLoading: PropTypes.bool.isRequired,
    handleChangeCertaintyThreshold: PropTypes.func.isRequired,
    getClassColor: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    annotationError: PropTypes.string
};

const mapStateToProps = state => ({
    ranges: state.addPaper.ranges,
    abstract: state.addPaper.abstract
});

const mapDispatchToProps = dispatch => ({});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme
)(AbstractAnnotatorView);
