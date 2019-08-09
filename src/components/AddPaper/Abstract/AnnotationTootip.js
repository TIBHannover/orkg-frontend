import React, { Component } from 'react';
import { Tooltip as ReactstrapTooltip } from 'reactstrap';
import AsyncCreatableSelect from 'react-select/async-creatable';
import PropTypes from 'prop-types';

class AnnotationTootip extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showTooltip: false,
        };
    }

    toggleTooltip = () => {
        this.setState({ showTooltip: !this.state.showTooltip });
    };

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

        let color = '#ffb7b7';
        switch (this.props.range.class.label) {
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
                color = '#ffb7b7';
        }

        return (
            <span>
                <span style={{ backgroundColor: color, color: 'black' }} id={`CR${this.props.range.id}`}>
                    {this.props.lettersNode}
                </span>
                <ReactstrapTooltip placement="top" autohide={false} target={`CR${this.props.range.id}`} className={'annotation-tooltip'} innerClassName={'annotation-tooltip-inner'} toggle={(e) => this.toggleTooltip()} isOpen={this.state.showTooltip}>
                    <AsyncCreatableSelect
                        loadOptions={this.props.loadOptions}
                        value={{
                            label: this.props.range.class.label,
                            id: this.props.range.class.id,
                        }}
                        getOptionLabel={({ label }) => label}
                        getOptionValue={({ id }) => id}
                        onChange={(e, a) => this.props.handleChangeAnnotationClass(e, a, this.props.range)}
                        key={(value) => value}
                        cacheOptions
                        defaultOptions
                        isClearable
                        placeholder="Select or Type something..."
                        styles={customStyles}
                    />
                </ReactstrapTooltip>
            </span>
        );
    }
}

AnnotationTootip.propTypes = {
    range: PropTypes.object,
    lettersNode: PropTypes.array,
    handleChangeAnnotationClass: PropTypes.func,
    loadOptions: PropTypes.func,
};

export default AnnotationTootip;
