'use client';

import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { AnchorHTMLAttributes, useEffect, useState } from 'react';

import KeyboardBanner from '@/app/grid-editor/components/KeyboardBanner';
import MainGrid from '@/app/grid-editor/components/MainGrid/MainGrid';
import getPreventEditCase from '@/app/grid-editor/components/PreventEditing/PreventConditions';
import PreventEditing from '@/app/grid-editor/components/PreventEditing/PreventEditing';
import RelatedPapersCarousel from '@/app/grid-editor/components/RelatedPapers/RelatedPaperCarousel';
import SelectEntities from '@/app/grid-editor/components/SelectEntities/SelectEntities';
import UpdateComparison from '@/app/grid-editor/components/UpdateComparison/UpdateComparison';
import GridProvider from '@/app/grid-editor/context/GridContext';
import SemantifyModalProvider from '@/app/grid-editor/context/SemantifyModalContext';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import usePaperContributionCheck from '@/app/grid-editor/hooks/usePaperContributionCheck';
import AddPaperModal from '@/components/PaperForm/AddPaperModal';
import TitleBar from '@/components/TitleBar/TitleBar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';

const GridEditorPage = () => {
    const [isOpenSelectEntities, setIsOpenSelectEntities] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [searchTerm, setSearchTerm] = useQueryState('q', { defaultValue: '' });
    const [comparisonId] = useQueryState('comparisonId', { defaultValue: '' });
    const { entityIds, setEntityIds, entities } = useEntities();

    // We use the first element of the entityIds array to check if it's a contribution of a paper that the comparison feature is enabled for
    const { paper } = usePaperContributionCheck(entityIds?.[0]);

    useEffect(() => {
        document.title = 'Grid editor - ORKG';
    }, []);

    const handleCreatePaper = ({ contributionId }: { contributionId: string }) => {
        setEntityIds((prev) => [...(prev || []), contributionId]);
        setIsOpenCreatePaper(false);
        setIsOpenSelectEntities(false);
    };

    const prevent = entities && entities.length > 0 ? entities.map((entity) => getPreventEditCase(entity)).filter((p) => p !== null) : [];
    const isViewComparisonButtonDisabled =
        !!(entityIds && entityIds?.length === 0) || !!(entityIds && entityIds?.length < 2) || (!paper && !comparisonId);

    const viewComparisonHref = comparisonId
        ? reverse(ROUTES.COMPARISON, { comparisonId })
        : `${reverse(ROUTES.CREATE_COMPARISON)}?sourceIds=${entityIds?.join(',') ?? ''}`;

    return (
        <div>
            <TitleBar
                buttonGroup={
                    <ButtonGroup size="sm">
                        {isViewComparisonButtonDisabled ? (
                            <Tooltip delay={150}>
                                <Button size="sm" isDisabled className="button--orkg-secondary">
                                    View comparison
                                </Button>
                                <Tooltip.Content className="max-w-xs">
                                    <Tooltip.Arrow />
                                    The selected entities are not part of a paper. You need to add at least 2 contributions to a paper to view the
                                    comparison.
                                </Tooltip.Content>
                            </Tooltip>
                        ) : (
                            <Button
                                size="sm"
                                className="button--orkg-secondary"
                                render={(props) => <Link {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} href={viewComparisonHref} />}
                            >
                                View comparison
                            </Button>
                        )}
                        <Button size="sm" className="button--orkg-secondary" onPress={() => setIsOpenSelectEntities(true)}>
                            <ButtonGroup.Separator />
                            <FontAwesomeIcon icon={faPlusCircle} /> Select entities
                        </Button>
                    </ButtonGroup>
                }
            >
                Grid editor
            </TitleBar>

            {prevent.length > 0 && <PreventEditing />}
            {comparisonId && <UpdateComparison />}
            {prevent.length === 0 && entityIds && entityIds.length > 0 && <KeyboardBanner />}
            {prevent.length === 0 && (
                <GridProvider>
                    <SemantifyModalProvider>
                        <MainGrid />
                        {entityIds && entityIds.length > 0 && (
                            <div className="my-2 px-4">
                                <RelatedPapersCarousel
                                    handleAddContributions={(title: string) => {
                                        setSearchTerm(title);
                                        setIsOpenSelectEntities(true);
                                    }}
                                    contributionIds={entityIds}
                                />
                            </div>
                        )}
                    </SemantifyModalProvider>
                </GridProvider>
            )}
            <SelectEntities
                entities={entities}
                setEntityIds={setEntityIds}
                allowCreate
                showDialog={isOpenSelectEntities}
                toggle={() => setIsOpenSelectEntities((v) => !v)}
                onCreatePaper={() => setIsOpenCreatePaper(true)}
            />
            {isOpenCreatePaper && (
                <AddPaperModal isOpen onCreatePaper={handleCreatePaper} toggle={() => setIsOpenCreatePaper((v) => !v)} initialValue={searchTerm} />
            )}
        </div>
    );
};

export default requireAuthentication(GridEditorPage);
