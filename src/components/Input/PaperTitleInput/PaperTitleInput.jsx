import PropTypes from 'prop-types';
import { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import styled, { withTheme } from 'styled-components';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import useExistingPaper from '@/components/ExistingPaperModal/useExistingPaper';
import Menu from '@/components/Input/PaperTitleInput/Menu';
import PaperOption from '@/components/Input/PaperTitleInput/PaperOption';
import { CLASSES } from '@/constants/graphSettings';
import { getResources } from '@/services/backend/resources';
import { getPapersByTitle } from '@/services/semanticScholar';

const PAGE_SIZE = 10;
const MIN_INPUT_LENGTH = 3;

export const StyledAutoCompleteInputFormControl = styled.div`
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    &.default {
        height: auto !important;
        min-height: calc(1.8125rem + 4px);
    }
    cursor: text;
    padding: 0 !important;
`;

function PaperTitleInput({
    value,
    onChange,
    onOptionClick,
    performExistingPaperLookup = true,
    performOrkgLookup = false,
    placeholder = '',
    contentType = 'all',
    borderRadius = null,
    theme,
    inputId = null,
    isDisabled = false,
}) {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { checkIfPaperExists, ExistingPaperModels } = useExistingPaper();

    const performSemanticScholarLookup = contentType === 'all' || contentType === CLASSES.PAPER;

    const loadOptions = async (titleQuery, prevOptions, { page }) => {
        const emptyList = {
            options: prevOptions,
            hasMore: false,
            additional: {
                page: 0,
            },
        };

        if (titleQuery.length < MIN_INPUT_LENGTH) {
            return emptyList;
        }

        const title = titleQuery.trim();
        let options = [];
        let hasMore = false;
        // let resources = {};

        // TODO: deduplicate results from ORKG and semantic scholar (based on title or DOI)
        try {
            if (performOrkgLookup) {
                const searchClasses = contentType === 'all' ? [CLASSES.PAPER, CLASSES.DATASET, CLASSES.SOFTWARE] : [contentType];

                const promises = [];
                for (const _class of searchClasses) {
                    promises.push(
                        getResources({
                            include: [_class],
                            page,
                            size: PAGE_SIZE,
                            q: title,
                        }),
                    );
                }
                for (const promise of await Promise.all(promises)) {
                    options = [...options, ...promise.content.map((result) => ({ ...result, isOrkgResource: true }))];
                    hasMore = !hasMore ? promise.page.number < promise.page.total_pages - 1 : hasMore;
                }
            }
        } catch (err) {
            console.error(err);
        }
        try {
            // only perform semantic scholar lookup if type type includes papers
            if ((!performOrkgLookup || !hasMore) && performSemanticScholarLookup) {
                const papers = await getPapersByTitle({
                    title,
                    limit: PAGE_SIZE,
                    offset: page * PAGE_SIZE,
                    fields: ['title', 'authors', 'venue', 'year', 'externalIds'],
                });
                options = [
                    ...options,
                    ...papers.data.map((item) => ({
                        ...item,
                        label: item.title,
                        id: item.paperId,
                    })),
                ];
                hasMore = !!papers.next;
            }
        } catch (err) {
            console.error(err);
        }
        return {
            options,
            hasMore,
            additional: {
                page: page + 1,
            },
        };
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
                checkIfPaperExists({ doi });
            }
        }
    };

    const noOptionsMessage = (input) =>
        input.inputValue?.length >= MIN_INPUT_LENGTH ? 'No existing items found' : 'Search by title input must be at least 3 characters';

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: 'inherit',
            boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(232, 97, 97, 0.25)' : 0,
            borderColor: state.isFocused ? '#f8d0d0!important' : '#ced4da!important',
            cursor: 'text!important',
            borderRadius: borderRadius || theme.borderRadius,
        }),
        container: (provided) => ({
            ...provided,
            borderRadius: 'inherit',
            background: 'inherit',
        }),
        menu: (provided) => ({
            ...provided,
            fontSize: '0.875rem',
            zIndex: 5,
        }),
    };

    return (
        <>
            <StyledAutoCompleteInputFormControl className="form-control border-0 rounded-0">
                <SelectGlobalStyle />
                <AsyncPaginate
                    // when isDisabled is true the input is hidden which makes the value not visible
                    value={isDisabled ? { label: value } : null}
                    inputValue={!isDisabled ? value : null}
                    isDisabled={isDisabled}
                    loadOptions={loadOptions}
                    onChange={handleChange}
                    debounceTimeout={300}
                    additional={{
                        page: 0,
                    }}
                    onInputChange={handleInputChange}
                    classNamePrefix="react-select"
                    noOptionsMessage={noOptionsMessage}
                    placeholder={placeholder}
                    styles={customStyles}
                    menuIsOpen={menuIsOpen}
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                    onMenuOpen={() => setMenuIsOpen(true)}
                    onMenuClose={() => setMenuIsOpen(false)}
                    performSemanticScholarLookup={performSemanticScholarLookup}
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                        Option: PaperOption,
                        Menu,
                    }}
                    inputId={inputId}
                />
            </StyledAutoCompleteInputFormControl>
            <ExistingPaperModels />
        </>
    );
}

PaperTitleInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onOptionClick: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    performExistingPaperLookup: PropTypes.bool,
    performOrkgLookup: PropTypes.bool,
    placeholder: PropTypes.string,
    contentType: PropTypes.string,
    borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inputId: PropTypes.string,
    isDisabled: PropTypes.bool,
};

export default withTheme(PaperTitleInput);
