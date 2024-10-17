'use client';

import { faPen, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import Confirm from 'components/Confirmation/Confirmation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useParams from 'components/useParams/useParams';
import SingleStatement from 'components/RosettaStone/SingleStatement/SingleStatement';
import ItemMetadata from 'components/Search/ItemMetadata';
import Tabs from 'components/Tabs/Tabs';
import TitleBar from 'components/TitleBar/TitleBar';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import ROUTES from 'constants/routes';
import { toInteger } from 'lodash';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactStringReplace from 'react-string-replace';
import { toast } from 'react-toastify';
import { Badge, Button, Container, ListGroup } from 'reactstrap';
import { deleteRSTemplate, getRSStatements, getRSTemplate, rosettaStoneUrl } from 'services/backend/rosettaStone';
import { isCurationAllowed } from 'slices/authSlice';
import { RootStore } from 'slices/types';
import useSWR from 'swr';

const RSTemplatePage = () => {
    const { id, activeTab } = useParams<{ id: string; activeTab: string }>();
    const { isEditMode } = useIsEditMode();
    const user = useSelector((state: RootStore) => state.auth.user);
    const isCurator = useSelector((state: RootStore) => isCurationAllowed(state));

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
        return <i key={i}>{template?.properties[i].placeholder}</i>;
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

    const { totalElements } = statements ?? { totalElements: 0 };

    const canDeleteTemplate = !!(user && !isLoadingStatements && totalElements === 0 && (isCurator || user?.id === template?.created_by));
    const canEditTemplate = !!user;

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError />)}
            {!isLoading && !error && template && (
                <>
                    <TitleBar
                        buttonGroup={
                            <Tippy content={preventEditTooltipText} disabled={canEditTemplate}>
                                <span>
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        tag={Link}
                                        href={reverse(ROUTES.RS_TEMPLATE_EDIT, { id })}
                                        disabled={!canEditTemplate}
                                    >
                                        <Icon icon={faPen} /> Edit statement type
                                    </Button>
                                </span>
                            </Tippy>
                        }
                    >
                        Statement type
                    </TitleBar>

                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
                        <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                            {template?.label || (
                                <i>
                                    <small>No label</small>
                                </i>
                            )}
                        </h3>
                        {!!user && (
                            <Tippy content={preventDeletionTooltipText} disabled={canDeleteTemplate}>
                                <span>
                                    <Button
                                        color="danger"
                                        size="sm"
                                        className="mt-2 mb-3"
                                        style={{ marginLeft: 'auto' }}
                                        onClick={handleDeleteTemplate}
                                        disabled={!canDeleteTemplate}
                                    >
                                        <Icon icon={faTrash} /> Delete statement type
                                    </Button>
                                </span>
                            </Tippy>
                        )}

                        <ItemMetadata item={template} showCreatedAt showCreatedBy editMode={isEditMode} />
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
                                                <Icon icon={faSpinner} className="me-2" spin />
                                            ) : (
                                                <Badge pill>{totalElements}</Badge>
                                            )}
                                        </>
                                    ),
                                    key: 'instances',
                                    children: (
                                        <div className="">
                                            {totalElements > 0 && (
                                                <ListGroup flush tag="div" className="mb-2">
                                                    {statements?.content?.map((s) => (
                                                        <SingleStatement showContext key={s.id} statement={s} reloadStatements={reloadStatements} />
                                                    ))}
                                                </ListGroup>
                                            )}
                                            {totalElements === 0 && <div className="text-center m-4">No instances</div>}
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
