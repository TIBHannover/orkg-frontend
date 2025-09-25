import { faCheck, faTimes, faXmark } from '@fortawesome/free-solid-svg-icons';
import { IHeaderParams } from 'ag-grid-community';
import { filter } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { Fragment, useState } from 'react';

import EditEntityDialog from '@/app/grid-editor/components/EditEntityDialog/EditEntityDialog';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import usePaperContributionCheck from '@/app/grid-editor/hooks/usePaperContributionCheck';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import ActionButton from '@/components/ActionButton/ActionButton';
import { ContributionButton } from '@/components/Comparison/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import EditPaperModal from '@/components/PaperForm/EditPaperModal';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import Button from '@/components/Ui/Button/Button';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Thing } from '@/services/backend/things';

type HeaderCellParams = IHeaderParams & {
    entity: Thing;
};

const HeaderCell = ({ entity }: HeaderCellParams) => {
    const { templates, isLoading: isLoadingUsedTemplates } = useTemplates();
    const usedTemplates = templates.filter((t) => entity && 'classes' in entity && entity.classes?.includes(t.target_class.id));
    const { entityIds, setEntityIds } = useEntities();
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [isOpenEditEntityModal, setIsOpenEditEntityModal] = useState(false);
    const [disableHover, setDisableHover] = useState(false);

    const { paper, mutate } = usePaperContributionCheck(entity?.id);

    const handleEditPaper = async () => {
        setIsOpenEditModal(true);
    };
    const handleUpdatePaper = () => {
        mutate();
        setIsOpenEditModal(false);
    };

    const onHideEntity = async () => {
        setEntityIds(filter(entityIds, (id) => id !== entity.id));
    };

    if (!entity) return null;
    return (
        <div className="tw:flex tw:flex-col tw:my-2 tw:gap-2 tw:group">
            {paper && (
                <Tooltip content="Edit paper's metadata">
                    <span>
                        <Button
                            color="link"
                            className="text-secondary-darker p-0 text-start text-decoration-none user-select-auto"
                            onClick={handleEditPaper}
                        >
                            <PaperTitle title={paper.title} className="tw:line-clamp-2 tw:text-white" />
                        </Button>
                    </span>
                </Tooltip>
            )}
            <div className="tw:flex tw:items-center tw:justify-between tw:w-full">
                <ContributionButton color="link" className="user-select-auto tw:text-left!" onClick={() => setIsOpenEditEntityModal(true)}>
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
                                    {entity.classes?.length === 0 && <i className="tw:text-secondary">No classes</i>}
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
                                            {usedTemplates?.length === 0 && <i>No templates applied</i>}
                                        </>
                                    )}
                                    {isLoadingUsedTemplates && (
                                        <div className="tw:p-1.5">
                                            <i>Loading ...</i>
                                        </div>
                                    )}
                                </>
                            )
                        }
                        disabled={entity._class !== ENTITIES.RESOURCE}
                    >
                        <strong className="tw:line-clamp-1">{entity.label}</strong>
                    </Tooltip>
                </ContributionButton>
                <div
                    className={`tw:transition-opacity tw:duration-200 ${disableHover ? 'tw:opacity-100' : 'tw:opacity-0 tw:group-hover:opacity-100'}`}
                >
                    <ActionButton
                        title="Remove entity"
                        icon={faXmark}
                        isDisabled={false}
                        requireConfirmation
                        confirmationMessage="Are you sure you want to remove this entity from the grid?"
                        confirmationButtons={[
                            {
                                title: 'Remove Entity',
                                color: 'warning',
                                icon: faCheck,
                                action: onHideEntity,
                            },
                            {
                                title: 'Cancel',
                                color: 'secondary',
                                icon: faTimes,
                            },
                        ]}
                        open={disableHover}
                        setOpen={setDisableHover}
                    />
                </div>
            </div>
            {isOpenEditEntityModal && <EditEntityDialog entity={entity} toggle={() => setIsOpenEditEntityModal(!isOpenEditEntityModal)} isOpen />}
            {isOpenEditModal && (
                <EditPaperModal
                    paperData={paper}
                    // @ts-expect-error TODO: waiting for the conversion to TS
                    afterUpdate={handleUpdatePaper}
                    toggle={() => setIsOpenEditModal(!isOpenEditModal)}
                    isPaperLinkVisible
                />
            )}
        </div>
    );
};

export default HeaderCell;
