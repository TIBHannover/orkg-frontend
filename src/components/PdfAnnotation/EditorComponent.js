import React from 'react';
import NativeListener from 'react-native-listener';
import { BaseEditorComponent } from '@handsontable/react';
import { InputGroup, DropdownMenu, InputGroupButtonDropdown, Input } from 'reactstrap';
import { StyledDropdownItem, StyledDropdownToggle } from 'components/StatementBrowser/styled';
import { resourcesUrl, predicatesUrl } from 'network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { setLabelCache } from 'actions/pdfAnnotation';
import Tippy from '@tippy.js/react';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import { createPredicate, createResource } from 'network';
import { isString } from 'lodash';

class EditorComponent extends BaseEditorComponent {
    constructor(props) {
        super(props);

        this.mainElementRef = React.createRef();
        this.resourceInputRef = React.createRef();
        this.literalInputRef = React.createRef();

        this.state = {
            value: '',
            row: 0,
            col: 0,
            type: '',
            top: 0,
            left: 0,
            show: false,
            valueType: 'literal',
            dropdownValueTypeOpen: false,
            valueClass: null
        };
    }

    setValue(value, callback) {
        this.setState((state, props) => {
            return { value: value };
        }, callback);
    }

    getValue() {
        return this.state.value;
    }

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    open = () => {
        const isResearchField = this.cellProperties?.instance?.getSourceDataAtCell(0, this.col) === 'paper:research_field';
        const isResearchProblem = this.cellProperties?.instance?.getSourceDataAtCell(0, this.col) === 'contribution:research_problem';

        let type = '';

        if (this.row === 0) {
            type = 'property';
        } else {
            type = 'resource';
        }

        let valueClass = null;
        if (isResearchField) {
            valueClass = process.env.REACT_APP_CLASSES_RESEARCH_FIELD;
        } else if (isResearchProblem) {
            valueClass = process.env.REACT_APP_CLASSES_PROBLEM;
        }

        this.setState({
            row: this.row,
            col: this.col,
            type,
            valueType: valueClass ? 'resource' : 'literal',
            valueClass,
            show: true
        });
    };

    close() {
        this.setState({
            show: false
        });
    }

    prepare(row, col, prop, td, originalValue, cellProperties) {
        // We'll need to call the `prepare` method from
        // the `BaseEditorComponent` class, as it provides
        // the component with the information needed to use the editor
        // (hotInstance, row, col, prop, TD, originalValue, cellProperties)
        super.prepare(row, col, prop, td, originalValue, cellProperties);

        const tdPosition = td.getBoundingClientRect();

        // As the `prepare` method is triggered after selecting
        // any cell, we're updating the styles for the editor element,
        // so it shows up in the correct position.
        const isResource =
            isString(originalValue) &&
            (originalValue.startsWith('orkg:') || originalValue.startsWith('paper:') || originalValue.startsWith('contribution:'));

        this.setState({
            valueType: isResource ? 'resource' : 'literal',
            left: tdPosition.left - 3 + 'px',
            top: tdPosition.top + window.scrollY - 8 + 'px'
        });
    }

    stopMousedownPropagation = e => {
        e.stopPropagation();
    };

    handleInputChange = value => {
        this.setState({ value: value });
    };

    confirmCreatePredicate = async label => {
        const result = window.confirm('Are you sure you want to create a new property?');

        if (result) {
            const newPredicate = await createPredicate(label);
            return newPredicate.id;
        }

        return false;
    };

    confirmCreateResource = async (label, valueClass) => {
        const result = window.confirm('Are you sure you want to create a new resource?');

        if (result) {
            const newResource = await createResource(label, valueClass ? [valueClass] : []);
            return newResource.id;
        }

        return false;
    };

    /*finishEditing = () => {
        This function can be used to keep the editor open when mouseDown is triggered
    };*/

    render() {
        let { value } = this.state;

        if (this.state.valueType === 'resource' && value && value.startsWith('orkg:')) {
            const valueClean = value.replace(/^(orkg:)/, '');
            value = { id: valueClean, label: this.props.cachedLabels[valueClean] };
        }

        const containerStyle = {
            display: this.state.show ? 'block' : 'none',
            position: 'absolute',
            left: this.state.left,
            top: this.state.top,
            background: '#fff',
            border: '1px solid #000',
            padding: '3px',
            zIndex: 9999,
            width: 300
        };

        return (
            <NativeListener onMouseDown={this.stopMousedownPropagation}>
                <div style={containerStyle} ref={this.mainElementRef} id="editorElement">
                    <InputGroup size="sm">
                        {this.state.type === 'resource' && !this.state.valueClass && (
                            <InputGroupButtonDropdown
                                addonType="prepend"
                                isOpen={this.state.dropdownValueTypeOpen}
                                toggle={() => this.toggle('dropdownValueTypeOpen')}
                            >
                                <StyledDropdownToggle>
                                    <small>{this.state.valueType.charAt(0).toUpperCase() + this.state.valueType.slice(1) + ' '}</small>
                                    <Icon size="xs" icon={faBars} />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => this.setState({ valueType: 'resource' })}>
                                        <Tippy content="Choose Object to link this to an object, which can contain values on its own">
                                            <span>Object</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => this.setState({ valueType: 'literal' })}>
                                        <Tippy content="Choose literal for values like numbers or plain text">
                                            <span>Literal</span>
                                        </Tippy>
                                    </StyledDropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                        )}
                        {this.state.valueType === 'resource' || this.state.type === 'property' ? (
                            <AutoComplete
                                requestUrl={this.state.type === 'property' ? predicatesUrl : resourcesUrl}
                                excludeClasses={`${process.env.REACT_APP_CLASSES_CONTRIBUTION},${process.env.REACT_APP_CLASSES_PROBLEM},${process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE}`}
                                optionsClass={this.state.valueClass ? this.state.valueClass : undefined}
                                placeholder={this.state.type === 'property' ? 'Enter a predicate' : 'Enter a resource'}
                                onChange={async i => {
                                    let valueID;
                                    if (i.__isNew__ && this.state.type === 'property') {
                                        valueID = await this.confirmCreatePredicate(i.value);
                                    } else if (i.__isNew__) {
                                        valueID = await this.confirmCreateResource(i.value, this.state.valueClass);
                                    }
                                    //i.__isNew__ (the user selected to create an new value)
                                    if (value || !i.__isNew__) {
                                        this.setState({ value: `orkg:${i.__isNew__ ? valueID : i.id}` }, () => {
                                            this.finishEditing();

                                            this.props.setLabelCache({
                                                id: i.__isNew__ ? valueID : i.id,
                                                label: i.__isNew__ ? i.value : i.label // we use value because the label contain "create" prefix
                                            });
                                        });
                                    }
                                }}
                                onInput={(e, value) => this.handleInputChange(e ? e.target.value : value)}
                                value={value}
                                disableBorderRadiusRight
                                disableBorderRadiusLeft={false}
                                cssClasses="form-control-sm"
                                eventListener={true}
                                innerRef={this.resourceInputRef}
                                allowCreate={this.state.type === process.env.REACT_APP_CLASSES_RESEARCH_FIELD ? false : true}
                            />
                        ) : (
                            <Input
                                placeholder="Enter a value"
                                name="literalValue"
                                type="text"
                                bsSize="sm"
                                value={value}
                                onChange={(e, value) => this.handleInputChange(e ? e.target.value : value)}
                                innerRef={this.literalInputRef}
                                autoFocus
                            />
                        )}
                    </InputGroup>
                </div>
            </NativeListener>
        );
    }
}

const mapStateToProps = state => ({
    cachedLabels: state.pdfAnnotation.cachedLabels
});

const mapDispatchToProps = dispatch => ({
    setLabelCache: payload => dispatch(setLabelCache(payload))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorComponent);
