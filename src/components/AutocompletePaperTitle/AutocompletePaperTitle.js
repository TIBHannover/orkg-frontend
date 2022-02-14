import { StyledAutoCompleteInputFormControl } from 'components/Autocomplete/Autocomplete';
import Menu from 'components/AutocompletePaperTitle/Menu';
import PaperOption from 'components/AutocompletePaperTitle/PaperOption';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { getPaperByDOI } from 'services/backend/misc';
import { getStatementsBySubject } from 'services/backend/statements';
import { getPapersByTitle } from 'services/semanticScholar';
import { getPaperData } from 'utils';
import ExistingDoiModal from 'components/AddPaper/GeneralData/ExistingDoiModal';

const PAGE_SIZE = 10;
const MIN_INPUT_LENGTH = 3;

function AutocompletePaperTitle({ value, onChange, onOptionClick, performExistingPaperLookup = true }) {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [existingPaper, setExistingPaper] = useState(null);

    const loadOptions = async (titleQuery, prevOptions, { page }) => {
        const emptyList = {
            options: prevOptions,
            hasMore: false,
            additional: {
                page: 0
            }
        };

        if (titleQuery.length < MIN_INPUT_LENGTH) {
            return emptyList;
        }

        try {
            const papers = await getPapersByTitle({
                title: titleQuery.trim(),
                limit: PAGE_SIZE,
                offset: page * PAGE_SIZE,
                fields: ['title', 'authors', 'venue', 'year', 'externalIds']
            });

            return {
                options: papers.data.map(item => ({
                    ...item,
                    label: item.title,
                    id: item.paperId
                })),
                hasMore: !!papers.next,
                additional: {
                    page: page + 1
                }
            };
        } catch (err) {
            console.error(err);
            return emptyList;
        }
    };

    const handleInputChange = (inputValue, { action }) => {
        if (action === 'input-change') {
            onChange(inputValue);
        }
        return inputValue;
    };

    const handleChange = async (selected, { action }) => {
        if (action === 'select-option') {
            setMenuIsOpen(false);
            onOptionClick(selected);

            const doi = selected.externalIds?.DOI;
            if (performExistingPaperLookup && doi && doi.includes('10.') && doi.startsWith('10.')) {
                try {
                    const paper = await getPaperByDOI(doi);
                    const paperStatements = await getStatementsBySubject({ id: paper.id });
                    setExistingPaper({
                        ...getPaperData({ ...paper, label: paper.title }, paperStatements),
                        title: paper.title
                    });
                } catch (e) {
                    setExistingPaper(null);
                }
            }
        }
    };

    const noOptionsMessage = input =>
        input?.inputValue?.length >= MIN_INPUT_LENGTH ? 'No options' : 'Search by title input must be at least 3 characters';
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: 'inherit',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(232, 97, 97, 0.25)' : 0,
            borderColor: state.isFocused ? '#f8d0d0!important' : '#ced4da!important',
            cursor: 'text!important'
        }),
        container: provided => ({
            ...provided,
            borderRadius: 'inherit',
            background: 'inherit'
        }),
        menu: provided => ({
            ...provided,
            fontSize: '0.875rem'
        })
    };

    return (
        <>
            <StyledAutoCompleteInputFormControl className="form-control border-0">
                <AsyncPaginate
                    value=""
                    loadOptions={loadOptions}
                    onChange={handleChange}
                    debounceTimeout={300}
                    additional={{
                        page: 0
                    }}
                    inputValue={value}
                    onInputChange={handleInputChange}
                    classNamePrefix="react-select"
                    loadOptionsOnMenuOpen={false}
                    noOptionsMessage={noOptionsMessage}
                    placeholder=""
                    styles={customStyles}
                    menuIsOpen={menuIsOpen}
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                    onMenuOpen={() => setMenuIsOpen(true)}
                    onMenuClose={() => setMenuIsOpen(false)}
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                        Option: PaperOption,
                        Menu
                    }}
                />
            </StyledAutoCompleteInputFormControl>
            {existingPaper && <ExistingDoiModal existingPaper={existingPaper} />}
        </>
    );
}

AutocompletePaperTitle.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onOptionClick: PropTypes.func.isRequired,
    performExistingPaperLookup: PropTypes.bool
};

export default AutocompletePaperTitle;
