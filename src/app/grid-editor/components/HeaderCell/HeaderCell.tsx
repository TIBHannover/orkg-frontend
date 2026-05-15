import { faCheck, faTimes, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button, Tooltip as HeroTooltip } from '@heroui/react';
import { IHeaderParams } from 'ag-grid-community';
import { filter } from 'lodash';
import Link from 'next/link';
import pluralize from 'pluralize';
import { Fragment, useState } from 'react';

import EditEntityDialog from '@/app/grid-editor/components/EditEntityDialog/EditEntityDialog';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import usePaperContributionCheck from '@/app/grid-editor/hooks/usePaperContributionCheck';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import ActionButton from '@/components/ActionButton/ActionButton';
import Tooltip from '@/components/FloatingUI/Tooltip';
import EditPaperModal from '@/components/PaperForm/EditPaperModal';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Thing } from '@/services/backend/things';

type HeaderCellParams = IHeaderParams & {
    entity: Thing;
};

const linkButtonClasses = '!bg-transparent !p-0 !min-w-0 h-auto min-h-0 text-left no-underline justify-start max-w-full block';

const HeaderCell = ({ entity }: HeaderCellParams) => {
    const { templates, isLoading: isLoadingUsedTemplates } = useTemplates();
    const usedTemplates = templates.filter((t) => entity && 'classes' in entity && entity.classes?.includes(t.target_class.id));
    const { entityIds, setEntityIds } = useEntities();
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [isOpenEditEntityModal, setIsOpenEditEntityModal] = useState(false);
    const [disableHover, setDisableHover] = useState(false);

    const { paper, mutate } = usePaperContributionCheck(entity?.id);

    const handleUpdatePaper = () => {
        mutate();
        setIsOpenEditModal(false);
    };

    const onHideEntity = async () => {
        setEntityIds(filter(entityIds, (id) => id !== entity.id));
    };

    if (!entity) return null;

    return (
        <div className="flex flex-col my-2 gap-1 group min-w-0">
            {paper && (
                <HeroTooltip delay={300}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`${linkButtonClasses} text-white/80 hover:text-white`}
                        onPress={() => setIsOpenEditModal(true)}
                    >
                        <PaperTitle title={paper.title} className="line-clamp-2 text-white" />
                    </Button>
                    <HeroTooltip.Content showArrow>
                        <HeroTooltip.Arrow />
                        Edit paper&apos;s metadata
                    </HeroTooltip.Content>
                </HeroTooltip>
            )}

            <div className="flex items-center justify-between gap-2 w-full min-w-0">
                <Tooltip
                    content={
                        entity._class === ENTITIES.RESOURCE &&
                        'classes' in entity && (
                            <>
                                Instance of:{' '}
                                {entity.classes?.map((c: string, index: number) => (
                                    <Fragment key={c}>
                                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: c })}>
                                            {c}
                                        </Link>
                                        {index + 1 !== entity.classes.length && ', '}
                                    </Fragment>
                                ))}
                                {entity.classes?.length === 0 && <i className="text-muted">No classes</i>}
                                <br />
                                Applied {pluralize('template', usedTemplates?.length ?? 0, false)}:{' '}
                                {!isLoadingUsedTemplates && (
                                    <>
                                        {usedTemplates?.map((t, index) => (
                                            <Fragment key={t.id}>
                                                <TemplateTooltip id={t.id}>
                                                    <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: t.id })}>
                                                        {t.label}
                                                    </Link>
                                                </TemplateTooltip>
                                                {index + 1 !== usedTemplates.length && ', '}
                                            </Fragment>
                                        ))}
                                        {usedTemplates?.length === 0 && <i className="text-muted">No templates applied</i>}
                                    </>
                                )}
                                {isLoadingUsedTemplates && <i className="text-muted">Loading...</i>}
                            </>
                        )
                    }
                    disabled={entity._class !== ENTITIES.RESOURCE}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`${linkButtonClasses} flex-1 text-white normal-case font-inherit text-base`}
                        onPress={() => setIsOpenEditEntityModal(true)}
                    >
                        <strong className="line-clamp-1 break-all text-white">{entity.label}</strong>
                    </Button>
                </Tooltip>

                <div className={`shrink-0 transition-opacity duration-200 ${disableHover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <ActionButton
                        title="Remove entity"
                        icon={faXmark}
                        isDisabled={false}
                        requireConfirmation
                        confirmationMessage="Are you sure you want to remove this entity from the grid?"
                        confirmationButtons={[
                            { title: 'Remove Entity', color: 'warning', icon: faCheck, action: onHideEntity },
                            { title: 'Cancel', color: 'secondary', icon: faTimes },
                        ]}
                        open={disableHover}
                        setOpen={setDisableHover}
                    />
                </div>
            </div>

            {isOpenEditEntityModal && <EditEntityDialog entity={entity} toggle={() => setIsOpenEditEntityModal((v) => !v)} isOpen />}
            {isOpenEditModal && (
                <EditPaperModal
                    paperData={paper ?? null}
                    afterUpdate={handleUpdatePaper}
                    toggle={() => setIsOpenEditModal(false)}
                    isPaperLinkVisible
                />
            )}
        </div>
    );
};

export default HeaderCell;
