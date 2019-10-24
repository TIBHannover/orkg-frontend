import React, { Component } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { withTheme } from 'styled-components';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

class AnnotationTootip extends Component {
    constructor(props) {
        super(props);

        this.tippyInstance = React.createRef();
    }

    render() {
        const customStyles = {
            control: (provided, state) => ({
                ...provided,
                background: 'inherit',
                boxShadow: state.isFocused ? 0 : 0,
                border: 0,
                paddingLeft: 0,
                paddingRight: 0,
                width: '250px',
                color: '#fff',
            }),
            placeholder: (provided) => ({
                ...provided,
                color: '#fff',
            }),
            singleValue: (provided) => ({
                ...provided,
                color: '#fff',
            }),
            input: (provided) => ({
                ...provided,
                color: '#fff',
            }),
            menu: (provided) => ({
                ...provided,
                zIndex: 10,
            }),
            menuList: (provided) => ({
                ...provided,
                backgroundColor: '#fff',
                opacity: 1,
                color: '#000',
            }),
        };
        return (
            <span>
                <Tippy
                    placement={'top'}
                    followCursor={true}
                    plugins={[followCursor]}
                    arrow={true}
                    interactive={true}
                    onCreate={instance => (this.tippyInstance.current = instance)}
                    content={
                        <AsyncCreatableSelect
                            loadOptions={this.props.loadOptions}
                            value={{
                                label: this.props.range.class.label,
                                id: this.props.range.class.id,
                                certainty: this.props.range.certainty,
                                range_id: this.props.range.id,
                            }}
                            getOptionLabel={({ label }) => label}
                            getOptionValue={({ id }) => id}
                            onChange={(e, a) => { this.props.handleChangeAnnotationClass(e, a, this.props.range); this.tippyInstance.current.hide(); }}
                            key={(value) => value}
                            cacheOptions
                            defaultOptions={this.props.defaultOptions}
                            isClearable
                            openMenuOnClick={false}
                            placeholder="Select or type something..."
                            styles={customStyles}
                        />}
                >
                    <span style={{ backgroundColor: this.props.getClassColor(this.props.range.class.label), color: 'black' }} id={`CR${this.props.range.id}`}>
                        {this.props.lettersNode}
                    </span>
                </Tippy>
            </span >
        );
    }
}

AnnotationTootip.propTypes = {
    range: PropTypes.object,
    lettersNode: PropTypes.array,
    handleChangeAnnotationClass: PropTypes.func,
    handleValidateAnnotation: PropTypes.func,
    loadOptions: PropTypes.func,
    getClassColor: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    defaultOptions: PropTypes.array.isRequired,
};


export default withTheme(AnnotationTootip);
