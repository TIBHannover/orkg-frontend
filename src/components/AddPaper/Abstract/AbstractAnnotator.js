import React, { Component } from 'react';
import PropTypes from 'prop-types';
import rangy from 'rangy';
import { compose } from 'redux';
import { predicatesUrl, submitGetRequest } from '../../../network';
import { connect } from 'react-redux';
import AnnotationTootip from './AnnotationTootip';

import { createAnnotation, updateAnnotationClass, removeAnnotation, validateAnnotation } from '../../../actions/addPaper';

function getAllIndexes(arr, val) {
    let indexes = [],
        i = -1;
    while ((i = arr.indexOf(val, i + 1)) !== -1) {
        indexes.push(i);
    }
    return indexes;
}

class AbstractAnnotator extends Component {
    constructor(props) {
        super(props);

        this.annotatorRef = React.createRef();

        this.state = {
            defaultOptions: []
        };
    }

    componentDidMount() {
        this.annotatorRef.current.addEventListener('mouseup', this.handleMouseUp);
        this.setState({ defaultOptions: this.props.classOptions });
    }

    componentWillUnmount() {
        this.annotatorRef.current.removeEventListener('mouseup', this.handleMouseUp);
    }

    IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(predicatesUrl + encodeURIComponent(valueWithoutHashtag));
                } catch (err) {
                    responseJsonExact = null;
                }

                if (responseJsonExact) {
                    responseJson.unshift(responseJsonExact);
                }
            }
        }

        return responseJson;
    };

    loadOptions = async value => {
        try {
            if (value === '' || value.trim() === '') {
                return this.props.classOptions;
            }

            let queryParams = '';

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1);
                queryParams = '&exact=true';
            }

            let responseJson = await submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(value) + queryParams);
            responseJson = await this.IdMatch(value, responseJson);

            if (this.state.defaultOptions && this.state.defaultOptions.length > 0) {
                let newProperties = this.state.defaultOptions;
                newProperties = newProperties.filter(({ label }) => label.includes(value)); // ensure the label of the new property contains the search value

                responseJson.unshift(...newProperties);
            }

            if (responseJson.length > this.maxResults) {
                responseJson = responseJson.slice(0, this.maxResults);
            }

            let options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id
                })
            );

            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    };

    renderCharNode = charIndex => {
        return (
            <span key={`c${charIndex}`} data-position={charIndex}>
                {this.props.abstract[charIndex]}
            </span>
        );
    };

    getRange = charPosition => {
        return (
            this.props.ranges &&
            Object.values(this.props.ranges).find(
                range => charPosition >= range.start && charPosition <= range.end && range.certainty >= this.props.certaintyThreshold
            )
        );
    };

    tooltipRenderer = (lettersNode, range) => {
        return (
            <AnnotationTootip
                loadOptions={this.loadOptions}
                key={`${range.id}`}
                range={range}
                lettersNode={lettersNode}
                handleChangeAnnotationClass={this.handleChangeAnnotationClass}
                handleValidateAnnotation={this.props.validateAnnotation}
                defaultOptions={this.state.defaultOptions}
                getClassColor={this.props.getClassColor}
            />
        );
    };

    getAnnotatedText = () => {
        const annotatedText = [];
        for (let charPosition = 0; charPosition < this.props.abstract.length; charPosition++) {
            const range = this.getRange(charPosition);
            const charNode = this.renderCharNode(charPosition);
            if (!range) {
                annotatedText.push(charNode);
                continue;
            }
            const annotationGroup = [charNode];
            let rangeCharPosition = charPosition + 1;
            for (; rangeCharPosition < parseInt(range.end) + 1; rangeCharPosition++) {
                annotationGroup.push(this.renderCharNode(rangeCharPosition));
                charPosition = rangeCharPosition;
            }
            annotatedText.push(this.tooltipRenderer(annotationGroup, range));
        }
        return annotatedText;
    };

    handleChangeAnnotationClass = (selectedOption, { action }, range) => {
        if (action === 'select-option') {
            this.props.updateAnnotationClass({ range, selectedOption });
        } else if (action === 'create-option') {
            const newOption = {
                label: selectedOption.label,
                id: selectedOption.label
            };
            this.props.updateAnnotationClass({ range, selectedOption: newOption });
            this.setState({ defaultOptions: [...this.state.defaultOptions, newOption] });
        } else if (action === 'clear') {
            this.props.removeAnnotation(range);
        }
    };

    handleMouseUp = () => {
        const sel = rangy.getSelection(this.annotatorRef.current);
        if (sel.isCollapsed) {
            return null;
        }
        // Get position of the node at which the user started selecting
        let start = parseInt(sel.anchorNode.parentNode.dataset.position);
        // Get position of the node at which the user stopped selecting
        let end = parseInt(sel.focusNode.parentNode.dataset.position);
        // Get the text within the selection
        let text = sel.toString();
        if (!text.length) {
            return null;
        }
        if (sel.isBackwards()) {
            // if the selection's focus is earlier in the document than the anchor
            [start, end] = [end, start];
        }
        // Find index of all occurrences of selected text in the abstract
        const pos = getAllIndexes(this.props.abstract, text);
        // Get the closest number out of occurrences positions
        if (pos === undefined || pos.length === 0) {
            return null;
        }
        const closest = pos.reduce(function(prev, curr) {
            return Math.abs(curr - start) < Math.abs(prev - start) ? curr : prev;
        }, 0);
        // Update position of selection
        start = closest;
        end = start + text.length - 1;
        // Save range in state
        let range = {
            start: start,
            end: end,
            text: text,
            class: { id: null, label: null },
            certainty: 1,
            isEditing: false
        };
        this.props.createAnnotation(range);
        window.getSelection().empty();
    };

    render() {
        const annotatedText = this.getAnnotatedText();
        return (
            <div>
                <div id="annotatedText" className={'mt-4'} style={{ lineHeight: '2.5em' }} ref={this.annotatorRef}>
                    {annotatedText}
                </div>
            </div>
        );
    }
}

AbstractAnnotator.propTypes = {
    ranges: PropTypes.object,
    abstract: PropTypes.string,
    createAnnotation: PropTypes.func.isRequired,
    removeAnnotation: PropTypes.func.isRequired,
    validateAnnotation: PropTypes.func.isRequired,
    updateAnnotationClass: PropTypes.func.isRequired,
    certaintyThreshold: PropTypes.number,
    classOptions: PropTypes.array.isRequired,
    getClassColor: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    abstract: state.addPaper.abstract,
    ranges: state.addPaper.ranges,
    rangeIdIndex: state.addPaper.rangeIdIndex,
    tourCurrentStep: state.addPaper.tourCurrentStep
});

const mapDispatchToProps = dispatch => ({
    createAnnotation: data => dispatch(createAnnotation(data)),
    validateAnnotation: data => dispatch(validateAnnotation(data)),
    removeAnnotation: data => dispatch(removeAnnotation(data)),
    updateAnnotationClass: data => dispatch(updateAnnotationClass(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(AbstractAnnotator);
