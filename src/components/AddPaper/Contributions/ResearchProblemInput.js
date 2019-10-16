import React, { Component, Fragment } from 'react';
import { StyledResearchFieldsInputFormControl, StyledResearchFieldBrowser } from './styled';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { components } from 'react-select';
import { getStatementsByPredicate } from '../../../network';


class ResearchProblemInput extends Component {

    constructor(props) {
        super(props)

        this.state = {
            researchProblems: [],
            problemBrowser: null,
            inputValue: '',
        }
    }

    componentDidMount() {
        // Get the statements that contains the has a research field as a predicate
        getStatementsByPredicate({
            id: process.env.REACT_APP_PREDICATES_HAS_RESEARCH_PROBLEM,
            page: 1,
            items: 999,
            sortBy: 'id',
            desc: true
        }).then((result) => {
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

    onKeyDown = (event) => {
        switch (event.keyCode) {
            case 13: // ENTER
                event.target.value.trim() === '' && event.preventDefault();
                break;
            default: {
                break;
            }
        }
    }

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
                paddingLeft: 0,
                paddingRight: 0,
            }),
            multiValue: (provided) => ({
                ...provided
            }),
            menu: (provided) => ({
                ...provided,
                zIndex: 10
            }),
            multiValueLabel: (provided) => ({
                ...provided,
                whiteSpace: 'normal',
            }),
            option: (provided) => ({
                ...provided,
                whiteSpace: 'normal',
            }),
            input: (provided) => ({
                ...provided,
                whiteSpace: 'normal',
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
                <StyledResearchFieldsInputFormControl id="researchProblemFormControl" className="form-control">
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
                        placeholder="Select or type something..."
                        styles={customStyles}
                        components={{ Menu, MultiValueLabel }}
                        options={this.state.researchProblems}
                        onKeyDown={this.onKeyDown}
                        openMenuOnClick={false}
                        onInputChange={this.onInputChange}
                        inputValue={this.state.inputValue}
                    />
                </StyledResearchFieldsInputFormControl>
                {
                    false && (
                        <StyledResearchFieldBrowser className="form-control">
                            <button type="button" className={'close'} onClick={this.closeProblemBrowser}><span>×</span></button>
                            <>Problem browser :</><br />
                            <><b>ID</b> {this.state.problemBrowser.id}</><br />
                            <><b>Label</b> {this.state.problemBrowser.label}</>
                        </StyledResearchFieldBrowser>)
                }
            </>
        );
    }
}

ResearchProblemInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
}

export default ResearchProblemInput;