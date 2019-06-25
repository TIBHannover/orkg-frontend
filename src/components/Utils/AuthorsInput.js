import React, { Component } from 'react';

import CreatableSelect from 'react-select/creatable';
import { StyledAuthorsInputFormControl } from './styled'
import { withTheme } from 'styled-components'
import PropTypes from 'prop-types';
import { getStatementsByPredicate } from '../../network';


class AuthorsInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            authors: [],
        }
    }

    componentDidMount() {
        // Get the statements that contains the has a author as a predicate
        getStatementsByPredicate(process.env.REACT_APP_PREDICATES_HAS_AUTHOR).then((result) => {
            // Get the authors without duplicates
            var authors = result.map((contribution) => {
                return contribution.object
            }).filter((author, index, self) =>
                index === self.findIndex((t) => (
                    t.id === author.id && t.label === author.label
                ))
            )
            // Set them to the list of authors and add the created options
            this.setState({
                authors: [...authors, ...this.props.value.filter(({ id }) => !authors.map(({ id }) => id).includes(id))],
                loading: false
            })
        })
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

    render() {

        const customStyles = {
            control: (provided, state) => ({
                ...provided,
                background: 'inherit',
                boxShadow: state.isFocused ? 0 : 0,
                border: 0,
                padding: '2px 5px'
            }),
            menu: (provided) => ({
                ...provided,
                zIndex: 10
            }),
            multiValueLabel: (provided) => ({
                ...provided,
                color: '#fff',
                padding: '0',
            }),
            multiValue: (provided) => ({
                ...provided,
                backgroundColor: this.props.theme.orkgPrimaryColor,
                borderRadius: '999px',
                border: `1px solid ${this.props.theme.orkgPrimaryColor}`,
                color: '#fff',
                padding: '0',
                margin: '0 0 2px 2px',
                fontSize: '90%',
            }),
            input: (provided) => ({
                ...provided,
                padding: '0',
                margin: '0 0 0 2px'
            }),
        }

        return (
            <StyledAuthorsInputFormControl className={'form-control clearfix'}>
                <CreatableSelect
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ id }) => id}
                    key={({ id }) => id}
                    value={this.props.value}
                    onChange={this.props.handler}
                    isClearable
                    isMulti
                    styles={customStyles}
                    onCreateOption={this.handleCreate}
                    options={this.state.authors}
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