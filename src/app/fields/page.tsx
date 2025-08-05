'use client';

import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

import ComparisonPopup from '@/components/ComparisonPopup/ComparisonPopup';
import CopyId from '@/components/CopyId/CopyId';
import ResearchFieldTabsContainer from '@/components/ResearchField/ResearchFieldTabsContainer';
import ResearchFieldSelector from '@/components/ResearchFieldSelector/ResearchFieldSelector';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import Col from '@/components/Ui/Structure/Col';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES, RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { Node, VisibilityOptions } from '@/services/backend/types';
import { reverseWithSlug } from '@/utils';

const ResearchFields = () => {
    const [menuOpen, setMenuOpen] = useState(false);
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
                    <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                        <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                            <FontAwesomeIcon icon={faEllipsisV} />
                        </DropdownToggle>
                        <DropdownMenu end="true">
                            <DropdownItem
                                tag={Link}
                                end="true"
                                href={`${reverse(ROUTES.RESOURCE, { id: selectedResearchFieldId ?? RESOURCES.RESEARCH_FIELD_MAIN })}?noRedirect`}
                            >
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
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2 className="h5">{selectedResearchField.label}</h2>
                                        <div className="d-flex align-items-center justify-content-end flex-wrap">
                                            <div className="flex-shrink-0 my-1">
                                                <CopyId id={selectedResearchFieldId} />
                                            </div>
                                            {selectedResearchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                                                <Button
                                                    tag={Link}
                                                    href={`${reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                                        researchFieldId: selectedResearchFieldId,
                                                        slug: selectedResearchField.label,
                                                    })}?sort=${sort}&include_subfields=${includeSubFields}&contentType=${contentType}`}
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
                                    <ResearchFieldTabsContainer id={selectedResearchFieldId} boxShadow={false} />
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
