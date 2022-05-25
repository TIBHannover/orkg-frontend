import ExistingDoiModal from 'components/AddPaper/GeneralData/ExistingDoiModal';
import { StyledAutoCompleteInputFormControl } from 'components/Autocomplete/Autocomplete';
import Menu from 'components/AutocompleteContentTypeTitle/Menu';
import PaperOption from 'components/AutocompleteContentTypeTitle/PaperOption';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { getPaperByDOI } from 'services/backend/misc';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubject } from 'services/backend/statements';
import { getPapersByTitle } from 'services/semanticScholar';
import { withTheme } from 'styled-components';
import { getPaperData } from 'utils';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';

const PAGE_SIZE = 10;
const MIN_INPUT_LENGTH = 3;

function AutocompleteContentTypeTitle({
    value,
    onChange,
    onOptionClick,
    performExistingPaperLookup = true,
    performOrkgLookup = false,
    placeholder = '',
    contentType = 'all',
    borderRadius = null,
    theme,
}) {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [existingPaper, setExistingPaper] = useState(null);

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

        try {
            const title = titleQuery.trim();
            let options = [];
            let hasMore = false;
            // let resources = {};

            // TODO: deduplicate results from ORKG and semantic scholar (based on title or DOI)
            if (performOrkgLookup) {
                const searchClasses = contentType === 'all' ? [CLASSES.PAPER, CLASSES.DATASET, CLASSES.SOFTWARE] : [contentType];

                const promises = [];
                for (const _class of searchClasses) {
                    promises.push(
                        getResourcesByClass({
                            id: _class,
                            page,
                            items: PAGE_SIZE,
                            q: title,
                        }),
                    );
                }
                for (const promise of await Promise.all(promises)) {
                    options = [...options, ...promise.content.map(result => ({ ...result, isOrkgResource: true }))];
                    hasMore = !hasMore ? !promise.last : hasMore;
                }

                /* resources = await getResources({
                    page: page,
                    items: PAGE_SIZE,
                    q: title
                });
                options = resources.content.map(result => ({ ...result, isOrkgResource: true }));
                hasMore = !resources.last; */
            }
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
                    ...papers.data.map(item => ({
                        ...item,
                        label: item.title,
                        id: item.paperId,
                    })),
                ];
                hasMore = !!papers.next;
            }
            return {
                options,
                hasMore,
                additional: {
                    page: page + 1,
                },
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
                        title: paper.title,
                    });
                } catch (e) {
                    setExistingPaper(null);
                }
            }
        }
    };

    const noOptionsMessage = input =>
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
        container: provided => ({
            ...provided,
            borderRadius: 'inherit',
            background: 'inherit',
        }),
        menu: provided => ({
            ...provided,
            fontSize: '0.875rem',
        }),
    };

    return (
        <>
            <StyledAutoCompleteInputFormControl className="form-control border-0 rounded-0">
                <SelectGlobalStyle />
                <AsyncPaginate
                    value=""
                    loadOptions={loadOptions}
                    onChange={handleChange}
                    debounceTimeout={300}
                    additional={{
                        page: 0,
                    }}
                    inputValue={value}
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
                />
            </StyledAutoCompleteInputFormControl>
            {existingPaper && <ExistingDoiModal existingPaper={existingPaper} />}
        </>
    );
}

AutocompleteContentTypeTitle.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onOptionClick: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    performExistingPaperLookup: PropTypes.bool,
    performOrkgLookup: PropTypes.bool,
    placeholder: PropTypes.string,
    contentType: PropTypes.string,
    borderRadius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default withTheme(AutocompleteContentTypeTitle);
