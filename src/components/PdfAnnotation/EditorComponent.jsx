import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BaseEditorComponent } from '@handsontable/react';
import dayjs from 'dayjs';
import { isString } from 'lodash';
import { createRef } from 'react';
import NativeListener from 'react-native-listener';
import { connect } from 'react-redux';
import { Dropdown, DropdownMenu, Input, InputGroup } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { StyledDropdownItem, StyledDropdownToggle } from '@/components/StatementBrowser/styled';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { createPredicate } from '@/services/backend/predicates';
import { createResource } from '@/services/backend/resources';
import { setLabelCache } from '@/slices/pdfAnnotationSlice';
import { range } from '@/utils';

class EditorComponent extends BaseEditorComponent {
    constructor(props) {
        super(props);

        this.mainElementRef = createRef();
        this.resourceInputRef = createRef();
        this.literalInputRef = createRef();

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
            valueClass: null,
        };
    }

    setValue(value, callback) {
        this.setState((state, props) => ({ value }), callback);
    }

    getValue() {
        return this.state.value;
    }

    toggle = (type) => {
        this.setState((prevState) => ({
            [type]: !prevState[type],
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
            valueClass = CLASSES.RESEARCH_FIELD;
        } else if (isResearchProblem) {
            valueClass = CLASSES.PROBLEM;
        }

        this.setState((prevState) => ({
            row: this.row,
            col: this.col,
            type,
            valueType: valueClass ? 'resource' : prevState.valueType,
            valueClass,
            show: true,
        }));
    };

    close() {
        this.setState({
            show: false,
        });
        this.clearHooks();
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
            left: `${tdPosition.left - 3}px`,
            top: `${tdPosition.top + window.scrollY - 8}px`,
        });
    }

    stopMousedownPropagation = (e) => {
        e.stopPropagation();
    };

    handleInputChange = (value) => {
        this.setState({ value });
    };

    confirmCreatePredicate = async (label) => {
        const result = window.confirm('Are you sure you want to create a new property?');

        if (result) {
            const newPredicateId = await createPredicate(label);
            return newPredicateId;
        }

        return false;
    };

    confirmCreateResource = async (label, valueClass) => {
        const result = window.confirm('Are you sure you want to create a new resource?');

        if (result) {
            const newResourceId = await createResource({ label, classes: valueClass ? [valueClass] : [] });
            return newResourceId;
        }

        return false;
    };

    /* finishEditing = () => {
        This function can be used to keep the editor open when mouseDown is triggered
    }; */

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
            width: 300,
        };

        // show a select input for publication month
        if (this.cellProperties?.instance?.getSourceDataAtCell(0, this.col) === 'paper:publication_month') {
            return (
                <NativeListener onMouseDown={this.stopMousedownPropagation}>
                    <div style={containerStyle} ref={this.mainElementRef} id="editorElement">
                        <Input
                            type="select"
                            onChange={(e, value) => this.handleInputChange(e ? e.target.value : value)}
                            name="paperPublicationMonth"
                            bsSize="sm"
                            innerRef={this.literalInputRef}
                            value={value}
                            onKeyDown={(e) => e.keyCode === 13 && this.finishEditing()}
                            aria-label="Select publication month"
                        >
                            <option value="" key="">
                                Month
                            </option>
                            {dayjs.months().map((el, index) => (
                                <option value={index + 1} key={index + 1}>
                                    {el}
                                </option>
                            ))}
                        </Input>
                    </div>
                </NativeListener>
            );
        }

        // show a select input for publication year
        if (this.cellProperties?.instance?.getSourceDataAtCell(0, this.col) === 'paper:publication_year') {
            return (
                <NativeListener onMouseDown={this.stopMousedownPropagation}>
                    <div style={containerStyle} ref={this.mainElementRef} id="editorElement">
                        <Input
                            type="select"
                            name="paperPublicationYear"
                            aria-label="Select publication year"
                            onChange={(e, value) => this.handleInputChange(e ? e.target.value : value)}
                            bsSize="sm"
                            innerRef={this.literalInputRef}
                            value={value}
                            onKeyDown={(e) => e.keyCode === 13 && this.finishEditing()}
                        >
                            <option value="" key="">
                                Year
                            </option>
                            {range(1900, dayjs().year() + 1)
                                .reverse()
                                .map((year) => (
                                    <option key={year}>{year}</option>
                                ))}
                        </Input>
                    </div>
                </NativeListener>
            );
        }

        return (
            <NativeListener onMouseDown={this.stopMousedownPropagation}>
                <div style={containerStyle} ref={this.mainElementRef} id="editorElement">
                    <InputGroup size="sm">
                        {this.state.valueType === 'resource' || this.state.type === 'property' ? (
                            <Autocomplete
                                entityType={this.state.type === 'property' ? ENTITIES.PREDICATE : ENTITIES.RESOURCE}
                                excludeClasses={[
                                    CLASSES.CONTRIBUTION,
                                    CLASSES.PROBLEM,
                                    CLASSES.NODE_SHAPE,
                                    CLASSES.PROPERTY_SHAPE,
                                    CLASSES.PAPER_DELETED,
                                    CLASSES.CONTRIBUTION_DELETED,
                                ]}
                                includeClasses={this.state.valueClass ? [this.state.valueClass] : undefined}
                                placeholder={this.state.type === 'property' ? 'Enter a property' : 'Enter a resource'}
                                onChange={async (i) => {
                                    let valueID;
                                    if (i.__isNew__ && this.state.type === 'property') {
                                        valueID = await this.confirmCreatePredicate(i.value);
                                    } else if (i.__isNew__) {
                                        valueID = await this.confirmCreateResource(i.value, this.state.valueClass);
                                    }
                                    // i.__isNew__ (the user selected to create an new value)
                                    if (valueID || !i.__isNew__) {
                                        this.setState({ value: `orkg:${i.__isNew__ ? valueID : i.id}` }, () => {
                                            this.finishEditing();

                                            this.props.setLabelCache({
                                                id: i.__isNew__ ? valueID : i.id,
                                                label: i.__isNew__ ? i.value : i.label, // we use value because the label contain "create" prefix
                                            });
                                        });
                                    }
                                }}
                                onInputChange={(newValue, actionMeta) => {
                                    if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                        this.handleInputChange(newValue);
                                    }
                                }}
                                value={value}
                                size="sm"
                                innerRef={this.resourceInputRef}
                                openMenuOnFocus
                                allowCreate={!(this.state.valueClass && this.state.valueClass === CLASSES.RESEARCH_FIELD)}
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
                                onKeyDown={(e) => e.keyCode === 13 && this.finishEditing()}
                                autoFocus
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        )}
                        {this.state.type === 'resource' && !this.state.valueClass && (
                            <Dropdown isOpen={this.state.dropdownValueTypeOpen} toggle={() => this.toggle('dropdownValueTypeOpen')}>
                                <StyledDropdownToggle disableBorderRadiusLeft>
                                    <small>{`${this.state.valueType.charAt(0).toUpperCase() + this.state.valueType.slice(1)} `}</small>
                                    <FontAwesomeIcon size="xs" icon={faBars} />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => this.setState({ valueType: 'resource' })}>
                                        <Tooltip content="Choose Object to link this to an object, which can contain values on its own">
                                            <span>Object</span>
                                        </Tooltip>
                                    </StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => this.setState({ valueType: 'literal' })}>
                                        <Tooltip content="Choose literal for values like numbers or plain text">
                                            <span>Literal</span>
                                        </Tooltip>
                                    </StyledDropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </InputGroup>
                </div>
            </NativeListener>
        );
    }
}

const mapStateToProps = (state) => ({
    cachedLabels: state.pdfAnnotation.cachedLabels,
});

const mapDispatchToProps = (dispatch) => ({
    setLabelCache: (payload) => dispatch(setLabelCache(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditorComponent);
