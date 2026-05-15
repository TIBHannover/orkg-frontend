'use client';

import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect } from 'react';
import useSWR from 'swr';

import CopyId from '@/components/CopyId/CopyId';
import ResearchFieldTabsContainer from '@/components/ResearchField/ResearchFieldTabsContainer';
import ResearchFieldSelector from '@/components/ResearchFieldSelector/ResearchFieldSelector';
import TitleBar from '@/components/TitleBar/TitleBar';
import Col from '@/components/Ui/Structure/Col';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES, RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { Node, VisibilityOptions } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

const ResearchFields = () => {
    const [selectedResearchFieldId, setSelectedResearchFieldId] = useQueryState('selectedResearchField', {
        defaultValue: RESOURCES.RESEARCH_FIELD_MAIN,
        parse: (value) => value as string,
        history: 'push',
    });

    useEffect(() => {
        document.title = 'Research field taxonomy browser - ORKG';
    }, []);

    const { data: selectedResearchField } = useSWR(
        selectedResearchFieldId ? [selectedResearchFieldId, resourcesUrl, 'getResource'] : null,
        ([params]) => getResource(params),
    );

    const [contentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });
    const [sort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });
    const [includeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const handleSelectResearchField = useCallback(
        (selected?: Node) => {
            if (selected) {
                setSelectedResearchFieldId(selected.id);
            }
        },
        [setSelectedResearchFieldId],
    );

    return (
        <>
            <TitleBar
                buttonGroup={
                    <Dropdown>
                        <Button size="sm" className="button--orkg-secondary" isIconOnly aria-label="More options">
                            <FontAwesomeIcon icon={faEllipsisV} />
                        </Button>
                        <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu aria-label="Options">
                                <Dropdown.Item
                                    href={`${reverse(ROUTES.RESOURCE, { id: selectedResearchFieldId ?? RESOURCES.RESEARCH_FIELD_MAIN })}?noRedirect`}
                                    textValue="View resource"
                                >
                                    View resource
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                }
            >
                Research fields taxonomy
            </TitleBar>
            <div className="mx-auto mb-4 max-w-container px-3">
                <div className="rounded bg-surface-tertiary p-4">
                    The ORKG research fields taxonomy facilitates browsing and exploring the research knowledge graph.{' '}
                    <a href="https://www.orkg.org/help-center/article/20/ORKG_Research_fields_taxonomy" target="_blank" rel="noreferrer">
                        Learn more in the help center
                    </a>
                    .
                </div>
            </div>
            <Container>
                <div className="box rounded-lg p-6">
                    <Row>
                        <Col md="5">
                            <ResearchFieldSelector
                                selectedResearchFieldId={selectedResearchFieldId}
                                updateResearchField={handleSelectResearchField}
                                showPreviouslySelected={false}
                                showStatistics
                            />
                        </Col>

                        <Col md="7">
                            {selectedResearchField && (
                                <>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl">{selectedResearchField.label}</h2>
                                        <div className="flex items-center justify-end flex-wrap">
                                            <div className="shrink-0 my-1">
                                                <CopyId id={selectedResearchFieldId} />
                                            </div>
                                            {selectedResearchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                                                <Link
                                                    href={`${reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                        researchFieldId: selectedResearchFieldId,
                                                        slug: selectedResearchField.label,
                                                    })}?sort=${sort}&include_subfields=${includeSubFields}&contentType=${contentType}`}
                                                    className="button button--ghost button--sm shrink-0 ml-2 my-1"
                                                >
                                                    Visit field page
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <hr />
                                    <ResearchFieldTabsContainer id={selectedResearchFieldId} boxShadow={false} />
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    );
};

export default ResearchFields;
