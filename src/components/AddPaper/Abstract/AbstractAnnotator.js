import { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import rangy from 'rangy';
import { compose } from 'redux';
import { connect } from 'react-redux';
import AnnotationTooltip from './AnnotationTooltip';

import { createAnnotation, updateAnnotationClass, removeAnnotation, validateAnnotation } from 'slices/addPaperSlice';

function getAllIndexes(arr, val) {
    const indexes = [];
    let i = -1;
    while ((i = arr.indexOf(val, i + 1)) !== -1) {
        indexes.push(i);
    }
    return indexes;
}

class AbstractAnnotator extends Component {
    constructor(props) {
        super(props);

        this.annotatorRef = createRef();

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
            <AnnotationTooltip
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
        const text = sel.toString();
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
        const range = {
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
                <div id="annotatedText" className="mt-4" style={{ lineHeight: '2.5em' }} ref={this.annotatorRef}>
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
    rangeIdIndex: state.addPaper.rangeIdIndex
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
