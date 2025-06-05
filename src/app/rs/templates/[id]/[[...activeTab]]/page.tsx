'use client';

import { faPen, faSpinner, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toInteger } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ReactStringReplace from 'react-string-replace';
import { toast } from 'react-toastify';
import { Badge, Button, Container, ListGroup } from 'reactstrap';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import Confirm from '@/components/Confirmation/Confirmation';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import SingleStatement from '@/components/RosettaStone/SingleStatement/SingleStatement';
import { SlotTooltip } from '@/components/RosettaStone/SlotTooltip/SlotTooltip';
import Tabs from '@/components/Tabs/Tabs';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { deleteRSTemplate, getRSStatements, getRSTemplate, rosettaStoneUrl } from '@/services/backend/rosettaStone';
import { Thing } from '@/services/backend/things';

const RSTemplatePage = () => {
    const { id, activeTab } = useParams<{ id: string; activeTab: string }>();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { user, isCurationAllowed } = useAuthentication();

    const { data: template, isLoading, error } = useSWR(id ? [id, rosettaStoneUrl, 'getRSTemplate'] : null, ([params]) => getRSTemplate(params));
    const {
        data: statements,
        isLoading: isLoadingStatements,

        mutate: reloadStatements,
    } = useSWR(id ? [id, rosettaStoneUrl, 'getRSStatements'] : null, ([params]) => getRSStatements({ template_id: params }));
    const router = useRouter();

    const onTabChange = (key: string) => router.push(reverse(ROUTES.RS_TEMPLATE_TABS, { id, activeTab: key }));

    useEffect(() => {
        document.title = `${template?.label ?? ''} - Statement type - ORKG`;
    }, [template]);

    const preventDeletionTooltipText = 'You cannot delete this statement type because it has some instances or you are not the creator';
    const preventEditTooltipText = 'You cannot edit this statement type because it has some instances or you are not the creator';

    const replacementFunction = (match: string) => {
        const i = toInteger(match);
        if (template?.properties[i]) {
            return (
                <SlotTooltip key={i} slot={template?.properties[i]}>
                    <i style={{ textDecoration: 'underline' }}>{template?.properties[i].placeholder}</i>
                </SlotTooltip>
            );
        }
        return match;
    };

    const handleDeleteTemplate = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this statement type?',
        });

        if (confirm) {
            try {
                await deleteRSTemplate(id);
                toast.success('Template deleted successfully');

                router.push(ROUTES.RS_TEMPLATES);
            } catch (err: unknown) {
                console.error(err);
                toast.error("Couldn't delete statement type");
            }
        }
    };

    const formattedLabelWithPlaceholders = ReactStringReplace(
        template?.formatted_label?.replaceAll(']', ' ').replaceAll('[', ' ') ?? '',
        /{(.*?)}/,
        replacementFunction,
    );

    const { page } = statements ?? { page: { total_elements: 0, total_pages: 0, size: 0, number: 0 } };

    const canDeleteTemplate = !!(
        user &&
        !isLoadingStatements &&
        page.total_elements === 0 &&
        (isCurationAllowed || user?.id === template?.created_by)
    );
    const canEditTemplate = !!user;

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && !error && template && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {!isEditMode && (
                                    <RequireAuthentication
                                        component={Button}
                                        className="float-end"
                                        color="secondary"
                                        style={{ marginRight: 2 }}
                                        size="sm"
                                        onClick={() => toggleIsEditMode()}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit metadata
                                    </RequireAuthentication>
                                )}
                                {isEditMode && (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                                <Button
                                    color="secondary"
                                    size="sm"
                                    tag={Link}
                                    href={reverse(ROUTES.RS_TEMPLATE_EDIT, { id })}
                                    disabled={!canEditTemplate}
                                >
                                    <Tooltip content={preventEditTooltipText} disabled={canEditTemplate}>
                                        <span>
                                            <FontAwesomeIcon icon={faPen} /> Edit statement type
                                        </span>
                                    </Tooltip>
                                </Button>
                            </>
                        }
                    >
                        Statement type
                    </TitleBar>
                    <EditModeHeader isVisible={isEditMode} />
                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
                        <h3 className="mb-3" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                            {template?.label || (
                                <i>
                                    <small>No label</small>
                                </i>
                            )}
                        </h3>
                        {isEditMode && !!user && (
                            <Tooltip content={preventDeletionTooltipText} disabled={canDeleteTemplate}>
                                <span>
                                    <Button
                                        color="danger"
                                        size="sm"
                                        className="mb-3"
                                        style={{ marginLeft: 'auto' }}
                                        onClick={handleDeleteTemplate}
                                        disabled={!canDeleteTemplate}
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> Delete statement type
                                    </Button>
                                </span>
                            </Tooltip>
                        )}

                        <ItemMetadata
                            item={
                                {
                                    ...template,
                                    observatory_id: template.observatories?.[0] ?? MISC.UNKNOWN_ID,
                                    organization_id: template.organizations?.[0] ?? MISC.UNKNOWN_ID,
                                } as unknown as Thing
                            }
                            showCreatedAt
                            showCreatedBy
                            showProvenance
                            editMode={isEditMode}
                        />
                    </Container>
                    <Container className="mt-3 p-0">
                        <Tabs
                            className="box rounded"
                            destroyInactiveTabPane
                            onChange={onTabChange}
                            activeKey={activeTab ?? 'information'}
                            items={[
                                {
                                    label: 'Statement type information',
                                    key: 'information',
                                    children: (
                                        <div className="p-4">
                                            <p className="mb-1">
                                                <b>Dynamic label:</b>
                                            </p>
                                            <div className="mb-3">{formattedLabelWithPlaceholders}</div>
                                            <p className="mb-1">
                                                <b>Description:</b>
                                            </p>
                                            {template.description && (
                                                <div>
                                                    <small className="text-muted">{template.description}</small>
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    label: (
                                        <>
                                            Instances{' '}
                                            {isLoadingStatements ? (
                                                <FontAwesomeIcon icon={faSpinner} className="me-2" spin />
                                            ) : (
                                                <Badge pill>{page.total_elements}</Badge>
                                            )}
                                        </>
                                    ),
                                    key: 'instances',
                                    children: (
                                        <div className="">
                                            {page.total_elements > 0 && (
                                                <ListGroup flush tag="div" className="mb-2">
                                                    {statements?.content?.map((s) => (
                                                        <SingleStatement showContext key={s.id} statement={s} reloadStatements={reloadStatements} />
                                                    ))}
                                                </ListGroup>
                                            )}
                                            {page.total_elements === 0 && <div className="text-center m-4">No instances</div>}
                                        </div>
                                    ),
                                },
                            ]}
                        />
                    </Container>
                </>
            )}
        </>
    );
};

export default RSTemplatePage;
