'use client';

import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { ReactElement, useEffect, useState } from 'react';

import KeyboardBanner from '@/app/grid-editor/components/KeyboardBanner';
import MainGrid from '@/app/grid-editor/components/MainGrid/MainGrid';
import getPreventEditCase from '@/app/grid-editor/components/PreventEditing/PreventConditions';
import PreventEditing from '@/app/grid-editor/components/PreventEditing/PreventEditing';
import RelatedPapersCarousel from '@/app/grid-editor/components/RelatedPapers/RelatedPaperCarousel';
import SelectEntities from '@/app/grid-editor/components/SelectEntities/SelectEntities';
import GridProvider from '@/app/grid-editor/context/GridContext';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import usePaperContributionCheck from '@/app/grid-editor/hooks/usePaperContributionCheck';
import Tooltip from '@/components/FloatingUI/Tooltip';
import AddPaperModal from '@/components/PaperForm/AddPaperModal';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import routes from '@/constants/routes';
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

    return (
        <div>
            <TitleBar
                buttonGroup={
                    <>
                        <ConditionalWrapper
                            condition={entityIds && entityIds?.length > 0 && isViewComparisonButtonDisabled}
                            // eslint-disable-next-line react/no-unstable-nested-components
                            wrapper={(children: ReactElement) => (
                                <Tooltip content="The selected entities are not part of a paper. You need to add at least 2 contributions to a paper to view the comparison">
                                    <ButtonGroup>{children}</ButtonGroup>
                                </Tooltip>
                            )}
                        >
                            <Button
                                tag={Link}
                                href={`${
                                    comparisonId
                                        ? reverse(routes.COMPARISON, { comparisonId })
                                        : `${reverse(routes.COMPARISON_NOT_PUBLISHED)}?contributions=${entityIds.join(',')}`
                                }`}
                                color="secondary"
                                size="sm"
                                style={{ marginRight: 2 }}
                                disabled={isViewComparisonButtonDisabled}
                            >
                                View comparison
                            </Button>
                        </ConditionalWrapper>
                        <Button color="secondary" size="sm" onClick={() => setIsOpenSelectEntities(true)}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Select entities
                        </Button>
                    </>
                }
            >
                Grid editor
            </TitleBar>

            {prevent.length > 0 && <PreventEditing />}
            {prevent.length === 0 && entityIds && entityIds.length > 0 && <KeyboardBanner />}
            {prevent.length === 0 && (
                <GridProvider>
                    <MainGrid />
                    {entityIds && entityIds.length > 0 && (
                        <div className="tw:my-2 tw:px-4">
                            <RelatedPapersCarousel
                                handleAddContributions={(title: string) => {
                                    setSearchTerm(title);
                                    setIsOpenSelectEntities(true);
                                }}
                                contributionIds={entityIds}
                            />
                        </div>
                    )}
                </GridProvider>
            )}
            <SelectEntities
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
