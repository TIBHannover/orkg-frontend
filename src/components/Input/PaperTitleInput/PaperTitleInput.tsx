'use client';

import { useState } from 'react';
import { GroupBase } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';

import { customClassNames, customStyles as autocompleteStyles } from '@/components/Autocomplete/styles';
import { OptionType } from '@/components/Autocomplete/types';
import useExistingPaper from '@/components/ExistingPaperModal/useExistingPaper';
import Menu from '@/components/Input/PaperTitleInput/Menu';
import PaperOption from '@/components/Input/PaperTitleInput/PaperOption';
import { CLASSES } from '@/constants/graphSettings';
import { getResources } from '@/services/backend/resources';
import { getPapersByTitle } from '@/services/semanticScholar';

const PAGE_SIZE = 10;
const MIN_INPUT_LENGTH = 3;

type Additional = { page: number };

type LoadResult = {
    options: OptionType[];
    hasMore: boolean;
    additional: Additional;
};

type PaperTitleInputProps = {
    value: string;
    onChange: (value: string) => void;
    // Callers narrow to their own option shape (e.g. Resource, SemanticScholarResult); use any here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onOptionClick: (option: any) => void;
    performExistingPaperLookup?: boolean;
    performOrkgLookup?: boolean;
    placeholder?: string;
    contentType?: string;
    inputId?: string;
    isDisabled?: boolean;
};

const PaperTitleInput = ({
    value,
    onChange,
    onOptionClick,
    performExistingPaperLookup = true,
    performOrkgLookup = false,
    placeholder = '',
    contentType = 'all',
    inputId,
    isDisabled = false,
}: PaperTitleInputProps) => {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const { checkIfPaperExists, ExistingPaperModals } = useExistingPaper();

    const performSemanticScholarLookup = contentType === 'all' || contentType === CLASSES.PAPER;

    const loadOptions = async (titleQuery: string, prevOptions: readonly unknown[], additional?: Additional): Promise<LoadResult> => {
        const page = additional?.page ?? 0;
        const emptyList: LoadResult = {
            options: [...(prevOptions as OptionType[])],
            hasMore: false,
            additional: { page: 0 },
        };

        if (titleQuery.length < MIN_INPUT_LENGTH) {
            return emptyList;
        }

        const title = titleQuery.trim();
        let options: OptionType[] = [];
        let hasMore = false;

        // TODO: deduplicate results from ORKG and semantic scholar (based on title or DOI)
        try {
            if (performOrkgLookup) {
                const searchClasses = contentType === 'all' ? [CLASSES.PAPER, CLASSES.DATASET, CLASSES.SOFTWARE] : [contentType];

                const promises = searchClasses.map((_class) =>
                    getResources({
                        include: [_class],
                        page,
                        size: PAGE_SIZE,
                        q: title,
                    }),
                );
                for (const resp of await Promise.all(promises)) {
                    options = [...options, ...resp.content.map((result) => ({ ...result, isOrkgResource: true }) as OptionType)];
                    hasMore = hasMore || resp.page.number < resp.page.total_pages - 1;
                }
            }
        } catch (err) {
            console.error(err);
        }

        try {
            if ((!performOrkgLookup || !hasMore) && performSemanticScholarLookup) {
                const papers = await getPapersByTitle({
                    title,
                    limit: PAGE_SIZE,
                    offset: page * PAGE_SIZE,
                    fields: ['title', 'authors', 'venue', 'year', 'externalIds'],
                });
                options = [
                    ...options,
                    ...(papers?.data ?? []).map(
                        (item: { title: string; paperId: string; [key: string]: unknown }) =>
                            ({
                                ...item,
                                label: item.title,
                                id: item.paperId,
                            }) as OptionType,
                    ),
                ];
                hasMore = !!papers?.next;
            }
        } catch (err) {
            console.error(err);
        }

        return {
            options,
            hasMore,
            additional: { page: page + 1 },
        };
    };

    const handleInputChange = (inputValue: string, meta: { action: string }) => {
        if (meta.action === 'input-change') {
            onChange(inputValue);
        }
        return inputValue;
    };

    const handleChange = async (selected: OptionType | null, meta: { action: string }) => {
        if (meta.action === 'select-option' && selected) {
            setMenuIsOpen(false);
            onOptionClick(selected);

            const doi = (selected as OptionType & { externalIds?: { DOI?: string } }).externalIds?.DOI;
            if (performExistingPaperLookup && doi && doi.startsWith('10.')) {
                checkIfPaperExists({ doi, title: '' });
            }
        }
    };

    const noOptionsMessage = (input: { inputValue: string }) =>
        input.inputValue?.length >= MIN_INPUT_LENGTH ? 'No existing items found' : 'Search by title input must be at least 3 characters';

    return (
        <>
            <div className="cursor-text">
                <AsyncPaginate<OptionType, GroupBase<OptionType>, Additional, false>
                    value={isDisabled ? ({ label: value } as OptionType) : null}
                    inputValue={!isDisabled ? value : undefined}
                    isDisabled={isDisabled}
                    loadOptions={loadOptions}
                    onChange={handleChange}
                    debounceTimeout={300}
                    additional={{ page: 0 }}
                    onInputChange={handleInputChange}
                    classNamePrefix="react-select"
                    classNames={customClassNames}
                    noOptionsMessage={noOptionsMessage}
                    placeholder={placeholder}
                    styles={autocompleteStyles}
                    menuPosition="fixed"
                    menuIsOpen={menuIsOpen}
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                    onMenuOpen={() => setMenuIsOpen(true)}
                    onMenuClose={() => setMenuIsOpen(false)}
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                        Option: PaperOption,
                        Menu,
                    }}
                    inputId={inputId}
                    // Pass through a flag that Menu.tsx reads via selectProps for the Semantic Scholar attribution.
                    {...({ performSemanticScholarLookup } as unknown as object)}
                />
            </div>
            <ExistingPaperModals />
        </>
    );
};

export default PaperTitleInput;
