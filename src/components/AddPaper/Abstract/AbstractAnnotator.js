import React, { Component } from 'react';
import PropTypes from 'prop-types';
import rangy from 'rangy';
import { compose } from 'redux';
import { predicatesUrl, submitGetRequest } from '../../../network';
import { connect } from 'react-redux';
import { withCookies, Cookies } from 'react-cookie';
import { withTheme } from 'styled-components';
import AnnotationTootip from './AnnotationTootip';
import {
    createAnnotation,
    updateAnnotationClass,
    removeAnnotation,
    validateAnnotation,
    openTour, closeTour, updateTourCurrentStep
} from '../../../actions/addPaper';
import Tour from 'reactour';

function getAllIndexes(arr, val) {
    var indexes = [],
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
            defaultOptions: [],
        };

        // check if a cookie of take a tour exist 
        if (this.props.cookies.get('taketour') === 'take' && this.props.tourCurrentStep === 1
            && !this.props.cookies.get('showedAbstract')) {
            this.props.openTour();
            this.props.cookies.set('showedAbstract', true);
        }
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

    loadOptions = async (value) => {
        try {
            if (value === '' || value.trim() === '') {
                return [];
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

            responseJson.map((item) =>
                options.push({
                    label: item.label,
                    id: item.id,
                }),
            );

            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    };

    renderCharNode(charIndex) {
        return (
            <span key={`c${charIndex}`} data-position={charIndex}>
                {this.props.abstract[charIndex]}
            </span>
        );
    }

    getRange(charPosition) {
        return this.props.ranges && Object.values(this.props.ranges).find((range) => (charPosition >= range.start) && (charPosition <= range.end) && (range.certainty >= this.props.certaintyThreshold));
    }

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
            />);
    };

    getAnnotatedText() {
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
    }

    handleChangeAnnotationClass = (selectedOption, { action }, range) => {
        if (action === 'select-option') {
            this.props.updateAnnotationClass({ range, selectedOption });
        } else if (action === 'create-option') {
            const newOption = {
                label: selectedOption.label,
                id: selectedOption.label,
            };
            this.props.updateAnnotationClass({ range, selectedOption });
            this.setState({ defaultOptions: [...this.state.defaultOptions, newOption] });
        } else if (action === 'clear') {
            this.props.removeAnnotation(range);
        }
    };

    handleMouseUp = () => {
        var sel = rangy.getSelection(this.annotatorRef.current);
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
        var pos = getAllIndexes(this.props.abstract, text);
        // Get the closest number out of occurrences positions
        if (pos === undefined || pos.length === 0) {
            return null;
        }
        var closest = pos.reduce(function (prev, curr) {
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
        };
        this.props.createAnnotation(range);
        window.getSelection().empty();
    };

    requestCloseTour = () => {
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.setState({ isClosed: true });
        }
    };

    render() {
        const annotatedText = this.getAnnotatedText();
        return (
            <div>
                <div id="annotatedText" className={'mt-4'} style={{ lineHeight: '2.5em' }} ref={this.annotatorRef}>
                    {annotatedText}
                </div>
                <Tour
                    steps={[
                        {
                            selector: '#annotatedText',
                            content: ({ goTo }) => (
                                <div>
                                    This an automatically annotated abstract. Feel free to edit and add new annotation by highlighting the text.<br />
                                    When you hover on one of the annotations, you get this 4 options in a tooltip: <br />
                                    <img src={require('../../../assets/img/annotationTooltip.png')} alt="" className="img-responsive" /><br />
                                    <ol>
                                        <li>Change the annotation label.</li>
                                        <li>Remove the annotation.</li>
                                        <li>Confirm the annotation : the number represents the level of certainty attached to this annotation.</li>
                                        <li>Show the list of label options.</li>
                                    </ol>
                                </div>
                            ),
                            style: { borderTop: '4px solid #E86161' },
                            position: 'right',
                        },
                        {
                            selector: '#certaintyOption',
                            content: 'Here you can adjust the certainty value, that means at which level you accept the automatic annotations. Only the shown annotations will be used in the create the contribution data in the next step.',
                            style: { borderTop: '4px solid #E86161' },
                        },
                        {
                            selector: '#annotationBadges',
                            content: 'Here you can see the annotation labels that we found in your abstract. Those labels will be used as properties in the contribution data.',
                            style: { borderTop: '4px solid #E86161' },
                        },
                        {
                            selector: '#skipStepButton',
                            content: 'You can skip this step, if you feel that the automatic annotations are not relevant or you don\'t want to use this feature to create the knowledge graph.',
                            style: { borderTop: '4px solid #E86161' },
                        },
                    ]}
                    showNumber={false}
                    accentColor={this.props.theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={this.requestCloseTour}
                    isOpen={this.props.isTourOpen}
                    startAt={0}
                    getCurrentStep={curr => { this.props.updateTourCurrentStep(curr); }}
                />
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
    theme: PropTypes.object.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    updateTourCurrentStep: PropTypes.func.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
    tourCurrentStep: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
    abstract: state.addPaper.abstract,
    ranges: state.addPaper.ranges,
    rangeIdIndex: state.addPaper.rangeIdIndex,
    isTourOpen: state.addPaper.isTourOpen,
    tourCurrentStep: state.addPaper.tourCurrentStep,
});

const mapDispatchToProps = (dispatch) => ({
    createAnnotation: (data) => dispatch(createAnnotation(data)),
    validateAnnotation: (data) => dispatch(validateAnnotation(data)),
    removeAnnotation: (data) => dispatch(removeAnnotation(data)),
    updateAnnotationClass: (data) => dispatch(updateAnnotationClass(data)),
    updateTourCurrentStep: (data) => dispatch(updateTourCurrentStep(data)),
    openTour: () => dispatch(openTour()),
    closeTour: () => dispatch(closeTour()),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withTheme,
    withCookies
)(AbstractAnnotator);
