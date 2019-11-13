import React, { Component } from 'react'
import Tooltip from '../../Utils/Tooltip';
import { submitGetRequest, createPredicate, predicatesUrl } from '../../../network';
import { Badge, Alert } from 'reactstrap';
import capitalize from 'capitalize';
import Tippy from '@tippy.js/react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AbstractAnnotator from './AbstractAnnotator';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import randomcolor from 'randomcolor';
import { Range, getTrackBackground } from 'react-range';
import { withTheme } from 'styled-components';
import toArray from 'lodash/toArray';
import { compose } from 'redux';


class AbstractAnnotatorView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            classColors: {
                'process': '#7fa2ff',
                'data': '	#9df28a',
                'material': '#EAB0A2',
                'method': '#D2B8E5',
            },
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
        this.props.handleChangeClassOptions(options)
    }

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
            (r) => (r.certainty >= this.props.certaintyThreshold)
        );
        let rangesClasses = [...new Set(rangeArray.map((r) => r.class.label))];
        return (
            <div className="pl-2 pr-2">
                {this.props.abstract &&
                    !this.props.isAnnotationLoading &&
                    !this.props.isAnnotationFailedLoading && (
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

                {!this.props.isAnnotationLoading && this.props.isAnnotationFailedLoading && (
                    <Alert color="light">
                        {this.props.annotationError ? this.props.annotationError : 'Failed to connect to the annotation service, please try again later'}
                    </Alert>
                )}
                {!this.props.isAbstractLoading && !this.props.isAnnotationLoading && (
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
                                            <Tippy key={`c${c}`} content={aconcept[0].description}>
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
                            certaintyThreshold={this.props.certaintyThreshold[0]}
                            classOptions={this.props.classOptions}
                            getClassColor={this.getClassColor}
                        />
                    </div>
                )}
                {!this.props.isAbstractLoading && !this.props.isAnnotationLoading &&
                    !this.props.isAnnotationFailedLoading && toArray(this.props.ranges).length > 0 && (
                        <div className={'col-3 float-right'}>
                            <div className={'mt-4'}>
                                <Range
                                    step={0.025}
                                    min={0}
                                    max={1}
                                    values={this.props.certaintyThreshold}
                                    onChange={(values) => this.props.handleChangeCertaintyThreshold(values)}
                                    renderTrack={({ props, children }) => (
                                        <div
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: '6px',
                                                width: '100%',
                                                background: getTrackBackground({
                                                    values: this.props.certaintyThreshold,
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
                                    <span className={'mr-2'}>Certainty {this.props.certaintyThreshold[0].toFixed(2)}</span>
                                    <Tooltip trigger={'click'} hideDefaultIcon={true} message="Here you can adjust the certainty value, that means at which level you accept the confidence ratio of automatic annotations. Only the shown annotations will be used to create the contribution data in the next step.">
                                        <Icon style={{ cursor: 'pointer' }} className={'text-primary'} icon={faQuestionCircle} />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        )
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
    handleChangeClassOptions: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    annotationError: PropTypes.string,
};

const mapStateToProps = (state) => ({
    ranges: state.addPaper.ranges,
    abstract: state.addPaper.abstract,
});

const mapDispatchToProps = (dispatch) => ({

});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme
)(AbstractAnnotatorView);