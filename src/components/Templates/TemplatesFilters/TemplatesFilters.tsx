'use client';

import { Checkbox, cn, Form, Input, Label } from '@heroui/react';
import { debounce } from 'lodash';
import { parseAsInteger, useQueryState } from 'nuqs';
import { FC } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

type TemplatesFiltersProps = {
    isLoading: boolean;
    size?: 'sm';
};

const TemplatesFilters: FC<TemplatesFiltersProps> = ({ isLoading, size }) => {
    const [, setPage] = useQueryState('page', parseAsInteger.withDefault(0));

    const [searchTerm, setSearchTerm] = useQueryState('q', {
        defaultValue: '',
    });
    const [researchField, setResearchField] = useQueryState('researchField', {
        defaultValue: '',
    });
    const [includeSubFields, setIncludeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });
    const [researchProblem, setResearchProblem] = useQueryState('researchProblem', {
        defaultValue: '',
    });
    const [targetClass, setTargetClass] = useQueryState('targetClass', {
        defaultValue: '',
    });

    const handleSearch = debounce((term: string) => {
        setSearchTerm(term);
    }, 500);

    const filterCommonProps = {
        openMenuOnFocus: true,
        allowCreate: false,
        isClearable: true,
        enableExternalSources: false,
        size,
    };

    const isSmall = size === 'sm';
    const inputClass = cn('w-full', isSmall && 'py-1 px-2 text-sm');
    const labelClass = cn(isSmall && 'text-sm');

    return (
        <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="filter-research-field" className={labelClass}>
                            Filter by research field
                        </Label>
                        <Checkbox
                            id="include-subfields"
                            isSelected={includeSubFields}
                            onChange={(selected) => {
                                setIncludeSubFields(selected);
                                setPage(0);
                            }}
                            isDisabled={isLoading}
                        >
                            <Checkbox.Content className={labelClass}>
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                Include subfields
                            </Checkbox.Content>
                        </Checkbox>
                    </div>
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        includeClasses={[CLASSES.RESEARCH_FIELD]}
                        placeholder="Select or type to enter a research field"
                        onChange={(v) => {
                            setResearchField(v?.id ?? '');
                            setPage(0);
                        }}
                        inputId="filter-research-field"
                        defaultValueId={researchField}
                        {...filterCommonProps}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="filter-research-problem" className={labelClass}>
                        Filter by research problem
                    </Label>
                    <Autocomplete
                        entityType={ENTITIES.RESOURCE}
                        includeClasses={[CLASSES.PROBLEM]}
                        placeholder="Select or type to enter a research problem"
                        onChange={(v) => {
                            setResearchProblem(v?.id ?? '');
                            setPage(0);
                        }}
                        inputId="filter-research-problem"
                        defaultValueId={researchProblem}
                        {...filterCommonProps}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="filter-label" className={labelClass}>
                        Filter by label
                    </Label>
                    <Input
                        type="text"
                        id="filter-label"
                        maxLength={MAX_LENGTH_INPUT}
                        onChange={(e) => {
                            handleSearch(e.target.value);
                            setPage(0);
                        }}
                        defaultValue={searchTerm}
                        className={inputClass}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="filter-class" className={labelClass}>
                        Filter by class
                    </Label>
                    <Autocomplete
                        entityType={ENTITIES.CLASS}
                        placeholder="Select or type to enter a class"
                        onChange={(v) => {
                            setTargetClass(v?.id ?? '');
                            setPage(0);
                        }}
                        inputId="filter-class"
                        defaultValueId={targetClass}
                        {...filterCommonProps}
                    />
                </div>
            </div>
        </Form>
    );
};

export default TemplatesFilters;
