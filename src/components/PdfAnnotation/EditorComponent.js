import React from 'react';
import NativeListener from 'react-native-listener';
import { BaseEditorComponent } from '@handsontable/react';
import { CustomInput } from 'reactstrap';
import nextId from 'react-id-generator';
import { submitGetRequest, resourcesUrl, predicatesUrl, getResourcesByClass } from 'network';
import { connect } from 'react-redux';
import { setLabelCache } from '../../actions/pdfAnnotation';
import { createPredicate, createResource } from 'network';
import { isString } from 'lodash';

class EditorComponent extends BaseEditorComponent {
    constructor(props) {
        super(props);

        this.mainElementRef = React.createRef();

        this.state = {
            value: '',
            isResource: false,
            row: 0,
            col: 0,
            inputSearch: '',
            options: [],
            type: '',
            top: 0,
            left: 0,
            show: false
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

    open = () => {
        const isResearchField = this.cellProperties?.instance?.getSourceDataAtCell(0, this.col) === 'paper:research_field';

        let type = '';

        if (this.row === 0) {
            type = 'property';
        } else if (isResearchField) {
            type = 'researchField';
        } else {
            type = 'resource';
        }

        this.setState({
            row: this.row,
            col: this.col,
            type,
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
            isResource: isResource,
            left: tdPosition.left - 3 + 'px',
            top: tdPosition.top + window.scrollY - 8 + 'px'
        });
    }

    stopMousedownPropagation = e => {
        e.stopPropagation();
    };

    handleInputChange = e => {
        this.setState({ value: e.target.value });
    };

    handleSearchChange = async e => {
        let value = e.target.value;
        const option = this.state.options.find(option => option.id === value);

        // if option from datalist is selected
        if (option) {
            if (value === 'Create new property:') {
                value = await this.confirmCreatePredicate(option.label);
            } else if (value === 'Create new resource:') {
                value = await this.confirmCreateResource(option.label);
            }

            this.setState({ value: `orkg:${value}` }, () => {
                this.finishEditing();

                this.props.setLabelCache({
                    id: value,
                    label: option.label
                });
            });
        } else {
            this.setState({ value: value }, () => {
                this.loadResults();
            });
        }
    };

    confirmCreatePredicate = async label => {
        const result = window.confirm('Are you sure you want to create a new property?');

        if (result) {
            const newPredicate = await createPredicate(label);
            return newPredicate.id;
        }

        return false;
    };

    confirmCreateResource = async label => {
        const result = window.confirm('Are you sure you want to create a new resource?');

        if (result) {
            const newResource = await createResource(label);
            return newResource.id;
        }

        return false;
    };

    loadResults = async (e = null) => {
        let { value } = this.state;
        const { type } = this.state;

        if (e) {
            value = e.target.value;
        }

        const url = type === 'resource' || type === 'researchField' ? resourcesUrl : predicatesUrl;
        let responseJson = [];
        if (type === 'researchField') {
            responseJson = await getResourcesByClass({
                id: process.env.REACT_APP_CLASSES_RESEARCH_FIELD,
                q: value,
                items: 10
            });
        } else {
            responseJson = await submitGetRequest(url + '?q=' + encodeURIComponent(value));
        }
        const options = [];
        let propertyExists = false;

        responseJson.map(item => {
            if (type === 'property' && value.toLowerCase() === item.label.toLowerCase()) {
                propertyExists = true;
            }
            return options.push({
                id: item.id,
                label: item.label
            });
        });

        // ensure "add options" is hidden when property already exists
        if (type === 'resource' || (type === 'property' && !propertyExists)) {
            options.push({
                id: 'Create new ' + type + ':',
                label: value
            });
        }

        this.setState({ options });
    };

    handleCheckboxChange = e => {
        if (!this.state.isResource) {
            this.loadResults();
        }
        this.setState(prevState => ({
            isResource: !prevState.isResource
        }));
    };

    /*finishEditing = () => {
        This function can be used to keep the editor open when mouseDown is triggered
    };*/

    render() {
        const checkboxId = nextId();
        let { value } = this.state;

        if (this.state.isResource && value && value.startsWith('orkg:')) {
            const valueClean = value.replace(/^(orkg:)/, '');
            value = this.props.cachedLabels[valueClean];
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
                    {this.state.isResource || this.state.type === 'property' || this.state.type === 'researchField' ? (
                        <>
                            <input
                                list="options"
                                value={value}
                                onChange={this.handleSearchChange}
                                onClick={this.loadResults}
                                style={{ width: '100%' }}
                                placeholder="Start searching now..."
                            />
                            <datalist id="options">
                                {this.state.options.map(({ id, label }) => (
                                    <option value={`${id}`}>{label}</option>
                                ))}
                            </datalist>
                        </>
                    ) : (
                        <input type="text" value={value} style={{ width: '100%' }} onChange={this.handleInputChange} />
                    )}
                    {this.state.type === 'resource' && (
                        <CustomInput
                            type="checkbox"
                            id={checkboxId}
                            label="Resource"
                            onChange={this.handleCheckboxChange}
                            checked={this.state.isResource}
                            style={{ marginLeft: 5 }}
                        />
                    )}
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
