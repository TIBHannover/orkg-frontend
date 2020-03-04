import React, { Component, Fragment } from 'react';
import { StyledResearchFieldsInputFormControl, StyledResearchFieldBrowser } from './styled';
import PropTypes from 'prop-types';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { components } from 'react-select';
import { connect } from 'react-redux';
import { guid } from 'utils';
import { getResourcesByClass } from 'network';
import styled from 'styled-components';

const StyledSelectOption = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    .badge {
        background-color: #ebecf0;
        border-radius: 2em;
        color: #172b4d;
        display: inline-block;
        font-size: 12;
        font-weight: normal;
        line-height: '1';
        min-width: 1;
        padding: 0.16666666666667em 0.5em;
        text-align: center;
    }
`;

class ResearchProblemInput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            problemBrowser: null,
            inputValue: ''
        };
    }

    loadOptions = async value => {
        try {
            // Get the resoures that contains 'Problem' as a class
            const responseJson = await getResourcesByClass({
                id: process.env.REACT_APP_CLASSES_PROBLEM,
                page: 1,
                items: 999,
                sortBy: 'created_at',
                desc: true,
                q: value
            });

            const research_problems = [];
            // Add newly added problem from other contributions
            for (const contributionId of this.props.contributions.allIds) {
                const contribution = this.props.contributions.byId[contributionId];
                for (const rp of contribution.researchProblems) {
                    if (!rp.existingResourceId) {
                        research_problems.push({ ...rp, new: true });
                    }
                }
            }
            responseJson.map(item =>
                research_problems.push({
                    label: item.label,
                    id: item.id,
                    existingResourceId: item.id
                })
            );

            return research_problems;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    handleCreate = (inputValue, val) => {
        const newOption = {
            label: inputValue,
            id: guid()
        };
        this.props.handler([...this.props.value, newOption], { ...val, createdOptionId: newOption.id });
    };

    closeProblemBrowser = () => {
        this.setState({ problemBrowser: null });
    };

    onKeyDown = event => {
        switch (event.keyCode) {
            case 13: // ENTER
                event.target.value.trim() === '' && event.preventDefault();
                break;
            default: {
                break;
            }
        }
    };

    onInputChange = (inputValue, val) => {
        if (val.action === 'input-blur') {
            if (this.state.inputValue !== '') {
                this.handleCreate(this.state.inputValue, { action: 'create-option', createdOptionLabel: this.state.inputValue }); //inputvalue is not provided on blur, so use the state value
            }
            this.setState({
                inputValue: ''
            });
        } else if (val.action === 'input-change') {
            this.setState({
                inputValue
            });
        } else if (val.action === 'set-value') {
            this.setState({
                inputValue: ''
            });
        }
    };

    render() {
        const customStyles = {
            control: (provided, state) => ({
                ...provided,
                background: 'inherit',
                boxShadow: state.isFocused ? 0 : 0,
                border: 0,
                paddingLeft: 0,
                paddingRight: 0
            }),
            multiValue: provided => ({
                ...provided
            }),
            menu: provided => ({
                ...provided,
                zIndex: 10
            }),
            multiValueLabel: provided => ({
                ...provided,
                whiteSpace: 'normal'
            }),
            option: provided => ({
                ...provided,
                whiteSpace: 'normal'
            }),
            input: provided => ({
                ...provided,
                whiteSpace: 'normal'
            })
        };

        const Menu = props => {
            return (
                <Fragment>
                    <components.Menu {...props}>{props.children}</components.Menu>
                </Fragment>
            );
        };

        const MultiValueLabel = props => {
            return (
                <div
                    onClick={() => {
                        this.setState({
                            problemBrowser: props.data
                        });
                    }}
                >
                    <components.MultiValueLabel {...props} />
                </div>
            );
        };

        const Option = ({ children, ...props }) => {
            return (
                <components.Option {...props}>
                    <StyledSelectOption>
                        <span>{children}</span>
                        {props.data.new && <span className={'badge'}>New</span>}
                    </StyledSelectOption>
                </components.Option>
            );
        };

        return (
            <>
                <StyledResearchFieldsInputFormControl id="researchProblemFormControl" className="form-control">
                    <AsyncCreatableSelect
                        value={this.props.value}
                        inputValue={this.state.inputValue}
                        onInputChange={this.onInputChange}
                        getOptionLabel={({ label }) => label}
                        getOptionValue={({ id }) => id}
                        onChange={this.props.handler}
                        key={({ id }) => id}
                        isClearable={false}
                        isMulti
                        openMenuOnClick={false}
                        placeholder="Select or type something..."
                        styles={customStyles}
                        components={{ Menu, MultiValueLabel, Option }}
                        onKeyDown={this.onKeyDown}
                        cacheOptions
                        loadOptions={this.loadOptions}
                        onCreateOption={inputValue => this.handleCreate(inputValue, { action: 'create-option', createdOptionLabel: inputValue })}
                        getNewOptionData={(inputValue, optionLabel) => ({ label: `Create research problem: "${inputValue}"`, id: inputValue })}
                    />
                </StyledResearchFieldsInputFormControl>
                {false && (
                    <StyledResearchFieldBrowser className="form-control">
                        <button type="button" className={'close'} onClick={this.closeProblemBrowser}>
                            <span>×</span>
                        </button>
                        <>Problem browser:</>
                        <br />
                        <>
                            <b>ID</b> {this.state.problemBrowser.id}
                        </>
                        <br />
                        <>
                            <b>Label</b> {this.state.problemBrowser.label}
                        </>
                    </StyledResearchFieldBrowser>
                )}
            </>
        );
    }
}

ResearchProblemInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
    contributions: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        contributions: state.addPaper.contributions
    };
};

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResearchProblemInput);
