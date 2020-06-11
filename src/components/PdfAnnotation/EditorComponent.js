import React from 'react';
import NativeListener from 'react-native-listener';
import { BaseEditorComponent } from '@handsontable/react';
import { CustomInput } from 'reactstrap';
import nextId from 'react-id-generator';
import { submitGetRequest, resourcesUrl, predicatesUrl } from 'network';
import { connect } from 'react-redux';
import { setLabelCache } from '../../actions/pdfAnnotation';

class EditorComponent extends BaseEditorComponent {
    constructor(props) {
        super(props);

        this.mainElementRef = React.createRef();
        this.containerStyle = {
            display: 'none',
            position: 'absolute',
            left: 0,
            top: 0,
            background: '#fff',
            border: '1px solid #000',
            padding: '3px',
            zIndex: 9999,
            width: 300
        };

        this.state = {
            value: '',
            isResource: false,
            row: 0,
            col: 0,
            inputSearch: '',
            options: [],
            type: ''
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
        this.setState({
            row: this.row,
            col: this.col,
            type: this.row === 0 ? 'property' : 'resource'
        });
        this.mainElementRef.current.style.display = 'block';
    };

    close() {
        return false;
        // TODO: replace this by "show" state
        //this.mainElementRef.current.style.display = 'none';
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
        this.mainElementRef.current.style.left = tdPosition.left - 3 + 'px';
        this.mainElementRef.current.style.top = tdPosition.top + window.scrollY - 8 + 'px';

        const isResource = originalValue && originalValue.startsWith('orkg:');

        this.setState({
            isResource: isResource
        });
    }

    stopMousedownPropagation = e => {
        e.stopPropagation();
    };

    handleInputChange = e => {
        this.setState({ value: e.target.value });
    };

    handleSearchChange = async e => {
        const value = e.target.value;

        for (const option of this.state.options) {
            if (option.id === value) {
                this.setState({ value: `orkg:${value}` }, () => {
                    this.props.setLabelCache({
                        id: option.id,
                        label: option.label
                    });
                    this.finishEditing();
                });
                return;
            }
        }

        this.setState({ value: value }, () => {
            this.loadResults();
        });
    };

    loadResults = async () => {
        const url = this.state.type === 'resource' ? resourcesUrl : predicatesUrl;
        const responseJson = await submitGetRequest(url + '?q=' + encodeURIComponent(this.state.value));

        const options = [];

        responseJson.map(item =>
            options.push({
                id: item.id,
                label: item.label
            })
        );

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

        return (
            <NativeListener onMouseDown={this.stopMousedownPropagation}>
                <div style={this.containerStyle} ref={this.mainElementRef} id="editorElement">
                    {this.state.isResource || this.state.type === 'property' ? (
                        <>
                            <input
                                list="browsers"
                                id="myBrowser"
                                name="myBrowser"
                                value={value}
                                onChange={this.handleSearchChange}
                                style={{ width: '100%' }}
                                placeholder="Start searching now..."
                            />
                            <datalist id="browsers">
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
