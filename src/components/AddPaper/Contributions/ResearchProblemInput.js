import React, { Fragment, useState, useCallback } from 'react';
import { StyledResearchFieldsInputFormControl, StyledResearchFieldBrowser } from './styled';
import PropTypes from 'prop-types';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { components } from 'react-select';
import { connect } from 'react-redux';
import { guid, compareOption } from 'utils';
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

function ResearchProblemInput(props) {
    const [problemBrowser, setProblemBrowser] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [createOnBlur, setCreateOnBlur] = useState(true);

    const loadOptions = useCallback(
        async value => {
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
                for (const contributionId of props.contributions.allIds) {
                    const contribution = props.contributions.byId[contributionId];
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
        },
        [props.contributions]
    );

    const handleCreate = (inputValue, val) => {
        const newOption = {
            label: inputValue,
            id: guid()
        };
        props.handler([...props.value, newOption], { ...val, createdOptionId: newOption.id });
    };

    const closeProblemBrowser = useCallback(() => {
        setProblemBrowser(null);
    }, []);

    const onKeyDown = useCallback(event => {
        switch (event.keyCode) {
            case 13: // ENTER
                event.target.value.trim() === '' && event.preventDefault();
                break;
            default: {
                break;
            }
        }
    }, []);

    const onInputChange = (inputVal, val) => {
        if (val.action === 'input-blur') {
            // check if there is an existing research problem

            if (inputValue !== '' && createOnBlur) {
                handleCreate(inputValue, { action: 'create-option', createdOptionLabel: inputValue }); //inputvalue is not provided on blur, so use the state value
            }
            setInputValue('');
        } else if (val.action === 'input-change') {
            setInputValue(inputVal);
        } else if (val.action === 'set-value') {
            setInputValue('');
        }
    };

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

    const Menu = useCallback(iprops => {
        return (
            <Fragment>
                <components.Menu {...iprops}>{iprops.children}</components.Menu>
            </Fragment>
        );
    }, []);

    const MultiValueLabel = useCallback(iprops => {
        return (
            <div
                onClick={() => {
                    this.setState({
                        problemBrowser: iprops.data
                    });
                }}
            >
                <components.MultiValueLabel {...iprops} />
            </div>
        );
    }, []);

    const Option = useCallback(({ children, ...iprops }) => {
        return (
            <components.Option {...iprops}>
                <StyledSelectOption>
                    <span>{children}</span>
                    {iprops.data.new && <span className="badge">New</span>}
                </StyledSelectOption>
            </components.Option>
        );
    }, []);

    return (
        <>
            <StyledResearchFieldsInputFormControl id="researchProblemFormControl" className="form-control">
                <AsyncCreatableSelect
                    hideSelectedOptions={true}
                    value={props.value}
                    inputValue={inputValue}
                    onInputChange={onInputChange}
                    getOptionLabel={({ label }) => label}
                    getOptionValue={({ id }) => id}
                    onChange={props.handler}
                    key={({ id }) => id}
                    isClearable={false}
                    isMulti
                    openMenuOnClick={false}
                    placeholder="Select or type something..."
                    styles={customStyles}
                    components={{ Menu, MultiValueLabel, Option }}
                    onKeyDown={onKeyDown}
                    cacheOptions
                    loadOptions={loadOptions}
                    onCreateOption={inputValue => handleCreate(inputValue, { action: 'create-option', createdOptionLabel: inputValue })}
                    getNewOptionData={(inputValue, optionLabel) => ({ label: `Create research problem: "${inputValue}"`, id: inputValue })}
                    isValidNewOption={(inputValue, selectValue, selectOptions) => {
                        //check if label exists
                        if (
                            inputValue &&
                            (selectOptions
                                .map(s =>
                                    String(s.label)
                                        .trim()
                                        .toLowerCase()
                                )
                                .includes(
                                    String(inputValue)
                                        .trim()
                                        .toLowerCase()
                                ) ||
                                selectValue
                                    .map(s =>
                                        String(s.label)
                                            .trim()
                                            .toLowerCase()
                                    )
                                    .includes(
                                        String(inputValue)
                                            .trim()
                                            .toLowerCase()
                                    ))
                        ) {
                            setCreateOnBlur(false);
                        } else {
                            setCreateOnBlur(true);
                        }

                        return !(
                            !inputValue ||
                            selectValue.some(option => compareOption(inputValue, option)) ||
                            selectOptions.some(option => compareOption(inputValue, option))
                        );
                    }}
                />
            </StyledResearchFieldsInputFormControl>
            {false && (
                <StyledResearchFieldBrowser className="form-control">
                    <button type="button" className="close" onClick={closeProblemBrowser}>
                        <span>×</span>
                    </button>
                    <>Problem browser:</>
                    <br />
                    <>
                        <b>ID</b> {problemBrowser.id}
                    </>
                    <br />
                    <>
                        <b>Label</b> {problemBrowser.label}
                    </>
                </StyledResearchFieldBrowser>
            )}
        </>
    );
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

export default connect(mapStateToProps)(ResearchProblemInput);
