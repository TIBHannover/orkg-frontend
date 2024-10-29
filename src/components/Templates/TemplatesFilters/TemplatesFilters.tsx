'use client';

import Autocomplete from 'components/Autocomplete/Autocomplete';
import { useRouter, useSearchParams } from 'next/navigation';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { debounce, isBoolean } from 'lodash';
import { FC } from 'react';
import { Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import { Node } from 'services/backend/types';

type TemplatesFiltersProps = {
    isLoading: boolean;
    size?: 'sm';
};

const TemplatesFilters: FC<TemplatesFiltersProps> = ({ isLoading, size }) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleChangeFilter = (value: Node | null | boolean, filerId: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && !isBoolean(value)) {
            params.set(filerId, value?.id);
        } else if (isBoolean(value)) {
            params.set(filerId, value.toString());
        } else {
            params.delete(filerId);
        }
        router.push(`?${params.toString()}`);
    };

    const handleSearch = debounce((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.push(`?${params.toString()}`);
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
                                    onChange={(e) => handleChangeFilter(e.target.checked, 'includeSubfields')}
                                    defaultValue={searchParams.get('includeSubfields')?.toString()}
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
                            onChange={(v) => handleChangeFilter(v as Node, 'researchField')}
                            inputId="filter-research-field"
                            defaultValueId={searchParams.get('researchField')?.toString()}
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
                            onChange={(v) => handleChangeFilter(v as Node, 'researchProblem')}
                            inputId="filter-research-problem"
                            defaultValueId={searchParams.get('researchProblem')?.toString()}
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
                            onChange={(e) => handleSearch(e.target.value)}
                            defaultValue={searchParams.get('q')?.toString()}
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
                            onChange={(v) => handleChangeFilter(v as Node, 'targetClass')}
                            inputId="filter-class"
                            defaultValueId={searchParams.get('targetClass')?.toString()}
                            {...filterCommonProps}
                        />
                    </FormGroup>
                </Col>
            </Row>
        </Form>
    );
};

export default TemplatesFilters;
