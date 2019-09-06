import React, { Component } from 'react';

import CreatableSelect from 'react-select/creatable';
import { StyledAuthorsInputFormControl } from './styled'
import { withTheme } from 'styled-components'
import PropTypes from 'prop-types';


class AuthorsInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            authors: [],
            inputValue: '',
        }
    }

    handleCreate = (inputValue) => {
        const newOption = {
            label: inputValue,
            id: inputValue,
        };
        this.setState({
            authors: [...this.state.authors, newOption]
        });
        this.props.handler([...this.props.value, newOption])
    };

    onInputChange = (inputValue, val) => {
        if (val.action === 'input-blur') {
            if (this.state.inputValue !== '') {
                this.handleCreate(this.state.inputValue); //inputvalue is not provided on blur, so use the state value
            }
            this.setState({
                inputValue: '',
            });
        } else if (val.action === 'input-change') {
            this.setState({
                inputValue
            });
        } else if (val.action === 'set-value') {
            this.setState({
                inputValue: '',
            });
        }
    }

    render() {

        const customStyles = {
            control: (provided, state) => ({
                ...provided,
                background: 'inherit',
                boxShadow: state.isFocused ? 0 : 0,
                border: 0,
                padding: '0 5px'
            }),
            menu: (provided) => ({
                ...provided,
                zIndex: 10
            }),
            multiValueLabel: (provided) => ({
                ...provided,
                color: '#fff',
                padding: '0'
            }),
            multiValue: (provided) => ({
                ...provided,
                backgroundColor: this.props.theme.orkgPrimaryColor,
                borderRadius: '999px',
                color: '#fff',
                margin: '0 0 2px 2px',
                fontSize: '90%',
            }),
            input: (provided) => ({
                ...provided,
                padding: '0',
                margin: '0 0 0 2px'
            }),
            multiValueRemove: (provided) => ({
                ...provided,
                borderRadius: '0 999px 999px 0',
                marginLeft: '2px',
            })
        }

        return (
            <StyledAuthorsInputFormControl className={'form-control clearfix'}>
                <CreatableSelect
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ id }) => id}
                    key={({ id }) => id}
                    value={this.props.value}
                    onChange={this.props.handler}
                    onCreateOption={this.handleCreate}
                    onInputChange={this.onInputChange}
                    inputValue={this.state.inputValue}
                    isClearable
                    isMulti
                    styles={customStyles}
                    placeholder={'Type an author fullname ...'}
                    noOptionsMessage={() => 'Enter both the first and last name.'}
                    formatCreateLabel={userInput => `Add the author : "${userInput}"`}
                />
            </StyledAuthorsInputFormControl>
        );

    }
}

AuthorsInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    theme: PropTypes.object.isRequired,
}

export default withTheme(AuthorsInput);