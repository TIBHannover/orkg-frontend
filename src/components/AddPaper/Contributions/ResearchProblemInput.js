import React, { Component, Fragment } from 'react';
import styles from './Contributions.module.scss';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { getStatementsByPredicate } from '../../../network';

/**
 * Functional stateless component (still have to decide on whether this should be standard or use the regular class structure)
 * TODO: consistency: try to replace some of the classes via props of TagsInputReact, instead of different render methods 
 */


class ResearchProblemInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            researchProblems: [],
            problemBrowser: null,
        }
    }

    componentDidMount() {
        // Get the statements that contains the has a research field as a predicate
        getStatementsByPredicate(process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM).then((result) => {
            // Get the research problems without duplicates
            var researchProblems = result.map((contribution) => {
                return contribution.object
            }).filter((researchProblem, index, self) =>
                index === self.findIndex((t) => (
                    t.id === researchProblem.id && t.label === researchProblem.label
                ))
            )
            // Set them to the list of research problems and add the created options
            this.setState({
                researchProblems: [...researchProblems, ...this.props.value.filter(({ id }) => !researchProblems.map(({ id }) => id).includes(id))],
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
            researchProblems: [...this.state.researchProblems, newOption]
        });
        this.props.handler([...this.props.value, newOption])
    };

    closeProblemBrowser = () => {
        this.setState({ problemBrowser: null });
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
            }),
            multiValue: (provided) => ({
                ...provided
            }),
            menu: (provided) => ({
                ...provided,
                zIndex:10
            })
        }

        const Menu = props => {
            return (
                <Fragment>
                    <components.Menu {...props}>{props.children}</components.Menu>
                </Fragment>
            );
        };

        const MultiValueLabel = props => {
            return (
                <div onClick={() => {
                    this.setState({
                        problemBrowser: props.data
                    });
                }}
                >
                    <components.MultiValueLabel {...props} />
                </div>
            );
        };

        return (
            <>
                <div className={`${styles.researchFieldsInput} form-control`} >
                    <CreatableSelect
                        //value={this.state.researchProblems.filter(({ id }) => this.props.value.includes(id))}
                        value={this.props.value}
                        getOptionLabel={({ label }) => label}
                        getOptionValue={({ id }) => id}
                        key={({ id }) => id}
                        isClearable
                        isMulti
                        onChange={this.props.handler}
                        onCreateOption={this.handleCreate}
                        placeholder="Select or Type something..."
                        styles={customStyles}
                        components={{ Menu, MultiValueLabel }}
                        options={this.state.researchProblems}
                        openMenuOnClick={false}
                    />
                </div >
                {this.state.problemBrowser && (
                    <div className={`${styles.researchFieldBrowser} form-control`} >
                        <button type="button" className={`close`} onClick={this.closeProblemBrowser}><span>×</span></button>
                        <>Problem browser :</><br />
                        <><b>ID</b> {this.state.problemBrowser.id}</><br />
                        <><b>Label</b> {this.state.problemBrowser.label}</>
                    </div >)}
            </>
        );
    }
}

ResearchProblemInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
}

export default ResearchProblemInput;