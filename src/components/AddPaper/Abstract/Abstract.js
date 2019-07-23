import React, { Component } from 'react';
import { Button, Alert, Card, CardBody, Label, Tooltip as ReactstrapTooltip, Badge} from 'reactstrap';
import { arxivUrl } from '../../../network';
import { connect } from 'react-redux';
import { updateAbstract, nextStep, previousStep } from '../../../actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import CreatableSelect from 'react-select/creatable';
import CustomHighlightable from './CustomHighlightable';
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
            idIndex: 0,
            toolTips: {},
            rangeClasses: {},
            tooltipOpen: false
        }
    }

    componentDidMount() {
        this.fetchAbstract();
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (JSON.stringify(this.state.toolTips) !== JSON.stringify(prevState.toolTips) || JSON.stringify(this.state.rangeClasses) !== JSON.stringify(prevState.rangeClasses)) {
            this.highlightableRef.current.forceUpdate();
        }
    }

    resetHightlight = (range) => {
        var filtered = this.state.ranges.filter(function (value, index, arr) {
            return value.data.id !== range.data.id;
        });
        let t = this.state.toolTips
        delete t[range.data.id];
        Object.keys(t).forEach(function (key, value) {
            return t[key] = false;
        })
        this.setState({ ranges: filtered, toolTips: t })
    }

    handleChangeAnnotation = (selectedOption, { action }, range) => {
        if (action !== 'clear') {
            this.setState({ rangeClasses: { ...this.state.rangeClasses, [range.data.id]: selectedOption.label } });
        } else {
            this.resetHightlight(range);
        }
    };

    handleCreate = (inputValue, range) => {
        const newOption = {
            label: inputValue,
            value: inputValue,
        };
        this.setState({
            classeOptions: [...this.state.classeOptions, newOption],
            rangeClasses: { ...this.state.rangeClasses, [range.data.id]: inputValue }
        });
    };

    tooltipRenderer = (lettersNode, range, rangeIndex, onMouseOverHighlightedWord) => {
        const customStyles = {
            control: (provided, state) => ({
                ...provided,
                background: 'inherit',
                boxShadow: state.isFocused ? 0 : 0,
                border: 0,
                paddingLeft: 0,
                paddingRight: 0,
                width: '250px',
                color: '#fff'
            }),
            placeholder: (provided) => ({
                ...provided,
                color: '#fff'
            }),
            singleValue: (provided) => ({
                ...provided,
                color: '#fff'
            }),
            input: (provided) => ({
                ...provided,
                color: '#fff'
            }),
            menu: (provided) => ({
                ...provided,
                zIndex: 10
            }),
            menuList: (provided) => ({
                ...provided,
                backgroundColor: '#fff',
                opacity: 1,
                color: '#000'
            }),

        }
        return (
            <span key={`${range.data.id}`}>
                <span id={`C${range.data.id}`}>{lettersNode}</span>
                <ReactstrapTooltip
                    placement="top"
                    autohide={false}
                    target={`C${range.data.id}`}
                    className={'annotation-tooltip'}
                    innerClassName={'annotation-tooltip-inner'}
                    toggle={(e) => this.onMouseOverHighlightedWord(range)}
                    isOpen={this.state.toolTips[range.data.id]}
                >
                    <CreatableSelect
                        value={this.state.classeOptions.filter(({ label }) => this.state.rangeClasses[range.data.id] === label)}
                        onChange={(e, a) => this.handleChangeAnnotation(e, a, range)}
                        //value={this.state.rangeClasses[range.data.id]}
                        getOptionLabel={({ label }) => label}
                        getOptionValue={({ value }) => value}
                        key={({ value }) => value}
                        options={this.state.classeOptions}
                        isClearable
                        onCreateOption={(e) => this.handleCreate(e, range)}
                        placeholder="Select or Type something..."
                        styles={customStyles}
                    />
                </ReactstrapTooltip>
            </span >
        );
    }

    getAnnotation = () => {
        this.setState({ isAnnotationLoading: true });
        return getAnnotations(this.props.abstract).catch((error) => {
            this.setState({ isAnnotationLoading: false });
        }).then((data) => {
            let rangeClasses = {}
            let annotated = []
            let ranges = data.entities.map((entity) => {
                let color = '#0052CC';
                switch (entity[1]) {
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
                let text = data.text.substring(entity[2][0][0], entity[2][0][1]);
                rangeClasses[entity[0]] = entity[1];
                if (annotated.indexOf(text.toLowerCase()) < 0) {
                    annotated.push(text.toLowerCase())
                    return {
                        text: text,
                        data: { id: entity[0], classe: entity[1] },
                        start: entity[2][0][0],
                        end: entity[2][0][1],
                        highlightStyle: {
                            backgroundColor: color
                        }
                    }
                }else{
                    return null;
                }
            }).filter(r => r)
            this.setState({ rangeClasses, ranges, isAnnotationLoading: false })
        });
    }

    onTextHighlightedCallback = (range) => {
        range['data'] = { ...range.data, id: this.state.idIndex + 1, classe: 'data' };
        this.setState({ idIndex: this.state.idIndex + 1, ranges: [...this.state.ranges, range], toolTips: { ...this.state.toolTips, [range.data.id]: false } })
    }

    onMouseOverHighlightedWord = (range) => {
        // showTooltip
        this.setState({ toolTips: { ...this.state.toolTips, [range.data.id]: !this.state.toolTips[range.data.id] } })
    }

    customRenderer = (currentRenderedNodes, currentRenderedRange, currentRenderedIndex, onMouseOverHighlightedWord) => {
        return this.tooltipRenderer(currentRenderedNodes, currentRenderedRange, currentRenderedIndex, onMouseOverHighlightedWord);
    }

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
                .then(response => response.text())
                .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml')) // parse the text as xml
                .then(xmlDoc => { // get the abstract from the xml doc
                    if (xmlDoc.getElementsByTagName('entry') && xmlDoc.getElementsByTagName('entry')[0]) {
                        return xmlDoc.getElementsByTagName('entry')[0].getElementsByTagName('summary')[0].innerHTML
                    }
                    return '';
                })
                .then(abstract => { // remove line breaks from the abstract
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
    }

    handleNextClick = () => {
        //TODO: add the annotated words as statements for the next step
        this.props.nextStep();
    }

    handleChangeAbstract = () => {
        if (this.state.changeAbstract) {
            this.getAnnotation();
        }
        this.setState((prevState) => ({
            changeAbstract: !prevState.changeAbstract,
        }));
    }

    handleChange = (event) => {
        this.props.updateAbstract(event.target.value);
    }

    render() {
        return (
            <div>
                <h2 className="h4 mt-4 mb-3">Abstract annotation</h2>

                {this.props.abstract && !this.state.changeAbstract &&
                    <Alert color="info">
                        <strong>Info:</strong> we automatically annotated the abstract for you. Please remove any incorrect annotations
                    </Alert>
                }

                <Card>
                    <CardBody>
                        {this.state.loading && <div className="text-center" style={{ fontSize: 30 }}><Icon icon={faSpinner} spin /></div>}

                        {!this.state.changeAbstract ?
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
                                        {this.state.rangeClasses && this.state.classeOptions.map((c)=> {
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
                                            //{Object.values(this.state.rangeClasses).filter(rc => rc===c.label).length }
                                            return <Badge style={{background: color}}>{c.label}</Badge>
                                        })}
                                        <CustomHighlightable
                                            id={'1'}
                                            style={{ lineHeight: '2.5em' }}
                                            ref={this.highlightableRef}
                                            ranges={this.state.ranges}
                                            onTextHighlighted={this.onTextHighlightedCallback}
                                            onMouseOverHighlightedWord={() => this.onMouseOverHighlightedWord}
                                            enabled={true}
                                            highlightStyle={{
                                                backgroundColor: '#ffcc80'
                                            }}
                                            rangeRenderer={this.customRenderer}
                                            text={this.props.abstract}
                                        />
                                    </div>
                                )}
                            </div>
                            :
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
                        }
                    </CardBody>
                </Card>

                <Button color="light" className="mb-2 mt-1" onClick={this.handleChangeAbstract}>{this.state.changeAbstract ? 'Annotate abstract' : 'Change abstract'}</Button>

                <hr className="mt-5 mb-3" />

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Next step</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>Previous step</Button>
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

const mapStateToProps = state => ({
    selectedResearchField: state.addPaper.selectedResearchField,
    title: state.addPaper.title,
    abstract: state.addPaper.abstract,
});

const mapDispatchToProps = dispatch => ({
    updateAbstract: (data) => dispatch(updateAbstract(data)),
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Annotation);