'use client';

import { faPen, faSpinner, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Chip, toast, Tooltip } from '@heroui/react';
import { toInteger } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ReactStringReplace from 'react-string-replace';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import Confirm from '@/components/Confirmation/Confirmation';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import useAuthentication from '@/components/hooks/useAuthentication';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import SingleStatement from '@/components/RosettaStone/SingleStatement/SingleStatement';
import { SlotTooltip } from '@/components/RosettaStone/SlotTooltip/SlotTooltip';
import Tabs from '@/components/Tabs/Tabs';
import TitleBar from '@/components/TitleBar/TitleBar';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { classesUrl, getClassById } from '@/services/backend/classes';
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

    const { data: targetClass, isLoading: isLoadingTargetClass } = useSWR(
        template?.target_class ? [template.target_class, classesUrl, 'getClassById'] : null,
        ([params]) => getClassById(params),
    );

    const onTabChange = (key: string) => router.push(reverse(ROUTES.RS_TEMPLATE_TABS, { id, activeTab: key }));

    useEffect(() => {
        document.title = `${template?.label ?? ''} - Statement template - ORKG`;
    }, [template]);

    const preventDeletionTooltipText = 'You cannot delete this statement template because it has some instances or you are not the creator';
    const preventEditTooltipText = 'You cannot edit this statement template because it has some instances or you are not the creator';

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
            message: 'Are you sure you want to delete this statement template?',
        });

        if (confirm) {
            try {
                await deleteRSTemplate(id);
                toast.success('Template deleted successfully');

                router.push(ROUTES.RS_TEMPLATES);
            } catch (err: unknown) {
                console.error(err);
                toast.danger("Couldn't delete statement template");
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
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && !error && template && (
                <>
                    <TitleBar
                        buttonGroup={
                            <ButtonGroup size="sm">
                                {!isEditMode ? (
                                    <RequireAuthentication
                                        component={Button}
                                        size="sm"
                                        className="button--orkg-secondary"
                                        onClick={() => toggleIsEditMode()}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit metadata
                                    </RequireAuthentication>
                                ) : (
                                    <Button size="sm" className="button--orkg-secondary" onPress={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                                <Tooltip isDisabled={canEditTemplate}>
                                    {canEditTemplate ? (
                                        <Button
                                            size="sm"
                                            className="button--orkg-secondary"
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            render={(props: any) => <Link {...props} href={reverse(ROUTES.RS_TEMPLATE_EDIT, { id })} />}
                                        >
                                            <ButtonGroup.Separator />
                                            <FontAwesomeIcon icon={faPen} /> Edit statement template
                                        </Button>
                                    ) : (
                                        <Button size="sm" className="button--orkg-secondary" isDisabled>
                                            <ButtonGroup.Separator />
                                            <FontAwesomeIcon icon={faPen} /> Edit statement template
                                        </Button>
                                    )}
                                    <Tooltip.Content>{preventEditTooltipText}</Tooltip.Content>
                                </Tooltip>
                            </ButtonGroup>
                        }
                    >
                        Statement template
                    </TitleBar>
                    <EditModeHeader isVisible={isEditMode} />
                    <Container>
                        <div className={`box flow-root pt-6 pb-6 pl-6 pr-6 ${isEditMode ? 'rounded-b' : 'rounded'}`}>
                            <h3 className="mb-4" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {template?.label || (
                                    <i>
                                        <small>No label</small>
                                    </i>
                                )}
                            </h3>
                            {isEditMode && !!user && (
                                <Tooltip isDisabled={canDeleteTemplate}>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="mb-4 ml-auto"
                                        onPress={handleDeleteTemplate}
                                        isDisabled={!canDeleteTemplate}
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> Delete statement template
                                    </Button>
                                    <Tooltip.Content>{preventDeletionTooltipText}</Tooltip.Content>
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
                        </div>
                    </Container>
                    <Container className="mt-4">
                        <Tabs
                            className="box rounded"
                            destroyOnHidden
                            onChange={onTabChange}
                            activeKey={activeTab ?? 'information'}
                            items={[
                                {
                                    label: 'Statement template information',
                                    key: 'information',
                                    children: (
                                        <div className="p-6">
                                            <p className="mb-1">
                                                <b>Dynamic label:</b>
                                            </p>
                                            <p className="mb-4">{formattedLabelWithPlaceholders}</p>

                                            <p className="mb-1">
                                                <b>Description:</b>
                                            </p>
                                            {template.description && <div className="mb-4 text-gray-500">{template.description}</div>}
                                            <p className="mb-4">
                                                <b>Target class: </b>
                                                {isLoadingTargetClass && <>Loading...</>}
                                                {!isLoadingTargetClass && targetClass && (
                                                    <DescriptionTooltip id={targetClass?.id} _class={ENTITIES.CLASS}>
                                                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: targetClass?.id })}>
                                                            {targetClass?.label}
                                                        </Link>
                                                    </DescriptionTooltip>
                                                )}
                                            </p>
                                        </div>
                                    ),
                                },
                                {
                                    label: (
                                        <>
                                            Instances{' '}
                                            {isLoadingStatements ? (
                                                <FontAwesomeIcon icon={faSpinner} className="mr-2" spin />
                                            ) : (
                                                <Chip size="sm">{page.total_elements}</Chip>
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
                                            {page.total_elements === 0 && <div className="text-center m-6">No instances</div>}
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
