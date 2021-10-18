import { Fragment, useState, useCallback } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { StyledResearchFieldsInputFormControl, StyledResearchFieldBrowser } from './styled';
import PropTypes from 'prop-types';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { components } from 'react-select';
import { guid, compareOption } from 'utils';
import { getResourcesByClass } from 'services/backend/resources';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { CLASSES } from 'constants/graphSettings';

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
    const [, setCreateOnBlur] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const selectedContribution = useSelector(state => state.viewPaper.contributions?.find(c => props.selectedContribution === c.id));
    const researchProblems = useSelector(state => {
        const result = [];
        // Add newly added problem from other contributions
        for (const contributionId of Object.keys(state.viewPaper.researchProblems)) {
            for (const rp of state.viewPaper.researchProblems[contributionId]) {
                if (!rp.existingResourceId) {
                    result.push({ ...rp, used: true });
                }
            }
        }
        return result;
    });

    const loadOptions = useCallback(
        async value => {
            setIsLoading(true);
            try {
                // Get the resources that contains 'Problem' as a class
                const responseJson = await getResourcesByClass({
                    id: CLASSES.PROBLEM,
                    page: 0,
                    items: 999,
                    sortBy: 'created_at',
                    desc: true,
                    q: value,
                    returnContent: true
                });

                const research_problems = researchProblems;
                responseJson.map(item =>
                    research_problems.push({
                        label: item.label,
                        id: item.id,
                        existingResourceId: item.id
                    })
                );
                setIsLoading(false);
                return research_problems;
            } catch (err) {
                setIsLoading(false);
                console.error(err);
                return [];
            }
        },
        [researchProblems]
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
            /*
            if (inputValue !== '' && createOnBlur) {
                handleCreate(inputValue, { action: 'create-option', createdOptionLabel: inputValue }); //inputvalue is not provided on blur, so use the state value
            }*/
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
            <div onClick={() => null} onKeyDown={e => (e.keyCode === 13 ? () => null : undefined)} role="button" tabIndex={0}>
                <components.MultiValueLabel {...iprops} />
            </div>
        );
    }, []);

    const MultiValueRemove = useCallback(({ children, ...iprops }) => {
        if (!iprops.data.isDeleting) {
            return <components.MultiValueRemove {...iprops}>{children}</components.MultiValueRemove>;
        } else {
            return (
                <div className={iprops.innerProps.className} onMouseDown={undefined}>
                    <Icon icon={faSpinner} size="xs" spin />
                </div>
            );
        }
    }, []);

    const Option = useCallback(({ children, ...iprops }) => {
        return (
            <components.Option {...iprops}>
                <StyledSelectOption>
                    <span>{children}</span>
                    {iprops.data.new && <span className="badge">New</span>}
                    {iprops.data.used && <span className="badge">Used</span>}
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
                    components={{ Menu, MultiValueLabel, Option, MultiValueRemove }}
                    onKeyDown={onKeyDown}
                    cacheOptions
                    loadOptions={loadOptions}
                    isLoading={isLoading || selectedContribution?.isAddingResearchProblem}
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
    selectedContribution: PropTypes.string
};

export default ResearchProblemInput;
