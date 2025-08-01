'use client';

import { debounce } from 'lodash';
import { parseAsInteger, useQueryState } from 'nuqs';
import { FC } from 'react';
import { Col, Row } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
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

    const handleSearch = debounce((term) => {
        setSearchTerm(term);
    }, 500);

    const filterCommonProps = {
        openMenuOnFocus: true,
        allowCreate: false,
        isClearable: true,
        enableExternalSources: false,
        size,
    };

    return (
        <Form>
            <Row>
                <Col md={6}>
                    <FormGroup>
                        <Label for="filter-research-field" className="d-flex">
                            <div className="flex-grow-1">Filter by research field</div>
                            <Label check className="mb-0 me-0">
                                <Input
                                    onChange={(e) => {
                                        setIncludeSubFields(e.target.checked);
                                        setPage(0);
                                    }}
                                    defaultValue={includeSubFields.toString()}
                                    type="checkbox"
                                    disabled={isLoading}
                                />{' '}
                                Include subfields
                            </Label>
                        </Label>
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
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label for="filter-research-problem">Filter by research problem</Label>
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
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <FormGroup>
                        <Label for="filter-label">Filter by label</Label>
                        <Input
                            type="text"
                            id="filter-label"
                            maxLength={MAX_LENGTH_INPUT}
                            onChange={(e) => {
                                handleSearch(e.target.value);
                                setPage(0);
                            }}
                            defaultValue={searchTerm}
                            bsSize={size}
                        />
                    </FormGroup>
                </Col>
                <Col md={6}>
                    <FormGroup>
                        <Label for="filter-class">Filter by class</Label>
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
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    );
};

export default TemplatesFilters;
