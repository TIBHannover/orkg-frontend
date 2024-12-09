'use client';

import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CardFactory from 'components/Cards/CardFactory/CardFactory';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ContentTypeListHeader from 'components/ContentTypeList/ContentTypeListHeader';
import CopyId from 'components/CopyId/CopyId';
import usePaginate from 'components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import ResearchFieldSelector, { ResearchField } from 'components/ResearchFieldSelector/ResearchFieldSelector';
import TitleBar from 'components/TitleBar/TitleBar';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES, RESOURCES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import { Button, ButtonDropdown, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { contentTypesUrl, getContentTypes } from 'services/backend/contentTypes';
import { Item, VisibilityOptions } from 'services/backend/types';
import { reverseWithSlug } from 'utils';

const ResearchFields = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedResearchField, setSelectedResearchField] = useState('');
    const [researchFields, setResearchFields] = useState<ResearchField[]>([]);
    const [researchFieldLabel, setResearchFieldLabel] = useState('');

    useEffect(() => {
        document.title = 'Research field taxonomy browser - ORKG';
    }, []);

    useEffect(() => {
        if (!selectedResearchField) {
            return;
        }
        const field = researchFields.find((rf) => rf.id === selectedResearchField);
        setResearchFieldLabel(field ? field.label : selectedResearchField);
    }, [selectedResearchField, researchFields]);

    const handleUpdate = useCallback((data: { selectedResearchField?: string; researchFields: ResearchField[] }) => {
        if (data.selectedResearchField) {
            setSelectedResearchField(data.selectedResearchField);
        }
        if (data.researchFields) {
            setResearchFields(data.researchFields);
        }
    }, []);

    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });
    const [includeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const renderListItem = (item: Item) => <CardFactory showBadge={false} showCurationFlags showAddToComparison key={item.id} item={item} />;

    const {
        data: items,
        isLoading,
        totalElements,
        page,
        hasNextPage,
        totalPages,
        error,
        pageSize,
        setPage,
        setPageSize,
    } = usePaginate({
        fetchFunction: getContentTypes,
        fetchUrl: contentTypesUrl,
        fetchFunctionName: 'getContentTypes',
        fetchExtraParams: {
            research_field: selectedResearchField,
            include_subfields: includeSubFields,
            visibility: sort,
            contentType: CLASSES.PAPER,
            published: true,
        },
    });
    return (
        <>
            <TitleBar
                buttonGroup={
                    <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                        <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                            <FontAwesomeIcon icon={faEllipsisV} />
                        </DropdownToggle>
                        <DropdownMenu end>
                            <DropdownItem tag={Link} end href={`${reverse(ROUTES.RESOURCE, { id: RESOURCES.RESEARCH_FIELD_MAIN })}?noRedirect`}>
                                View resource
                            </DropdownItem>
                        </DropdownMenu>
                    </ButtonDropdown>
                }
            >
                Research fields taxonomy
            </TitleBar>
            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                The ORKG research fields taxonomy facilitates browsing and exploring the research knowledge graph.{' '}
                <a href="https://www.orkg.org/help-center/article/20/ORKG_Research_fields_taxonomy" target="_blank" rel="noreferrer">
                    Learn more in the help center
                </a>
                .
            </Container>
            <Container className="p-0">
                <div className="box rounded-3 p-4">
                    <Row>
                        <Col md="5" className="border-right">
                            <ResearchFieldSelector
                                selectedResearchField={selectedResearchField}
                                researchFields={researchFields as ResearchField[]}
                                updateResearchField={handleUpdate}
                                showPreviouslySelected={false}
                                showStatistics
                            />
                        </Col>

                        <Col md="7">
                            {selectedResearchField && (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2 className="h5">{researchFieldLabel}</h2>
                                        <div className="d-flex align-items-center justify-content-end flex-wrap">
                                            <div className="flex-shrink-0 my-1">
                                                <CopyId id={selectedResearchField} />
                                            </div>
                                            {selectedResearchField !== RESOURCES.RESEARCH_FIELD_MAIN && (
                                                <Button
                                                    tag={Link}
                                                    href={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                        researchFieldId: selectedResearchField,
                                                        slug: researchFieldLabel,
                                                    })}
                                                    color="light"
                                                    size="sm"
                                                    className="flex-shrink-0 ms-2 my-1"
                                                >
                                                    Visit field page
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <hr />
                                    <ContentTypeListHeader label="Papers" isLoading={isLoading} totalElements={totalElements} showSubFieldsFilter />
                                    <ListPaginatedContent<Item>
                                        renderListItem={renderListItem}
                                        pageSize={pageSize}
                                        label="Research Field"
                                        isLoading={isLoading}
                                        items={items ?? []}
                                        hasNextPage={hasNextPage}
                                        page={page}
                                        setPage={setPage}
                                        setPageSize={setPageSize}
                                        totalElements={totalElements}
                                        error={error}
                                        totalPages={totalPages}
                                        boxShadow={false}
                                        flush={false}
                                    />
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
                <ComparisonPopup />
            </Container>
        </>
    );
};

export default ResearchFields;
