import React from 'react';
import NativeListener from 'react-native-listener';
import { BaseEditorComponent } from '@handsontable/react';
import { CustomInput, Input } from 'reactstrap';

export class EditorComponent extends BaseEditorComponent {
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
            value: ''
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

    open() {
        this.mainElementRef.current.style.display = 'block';
    }

    close() {
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
    }

    setLowerCase() {
        this.setState(
            (state, props) => {
                return { value: this.state.value.toString().toLowerCase() };
            },
            () => {
                this.finishEditing();
            }
        );
    }

    setUpperCase() {
        this.setState(
            (state, props) => {
                return { value: this.state.value.toString().toUpperCase() };
            },
            () => {
                this.finishEditing();
            }
        );
    }

    stopMousedownPropagation(e) {
        e.stopPropagation();
    }

    handleInputChange = e => {
        this.setState({ value: e.target.value });
    };

    render() {
        return (
            <NativeListener onMouseDown={this.stopMousedownPropagation}>
                <div style={this.containerStyle} ref={this.mainElementRef} id="editorElement">
                    {/*<button onClick={this.setLowerCase.bind(this)}>{this.state.value.toLowerCase()}</button>
                    <button onClick={this.setUpperCase.bind(this)}>{this.state.value.toUpperCase()}</button>*/}
                    <input type="text" value={this.state.value} style={{ width: '100%' }} onChange={this.handleInputChange} />
                    <CustomInput
                        type="checkbox"
                        id={'cellIsResource'}
                        label="Resource"

                        //onChange={() => this.toggleCheckbox('includeFootnote')}
                        //checked={this.state.includeFootnote}
                    />
                </div>
            </NativeListener>
        );
    }
}
