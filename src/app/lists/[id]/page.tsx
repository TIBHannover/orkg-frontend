'use client';

import { faCheckCircle, faEllipsisV, faHistory, faPen, faSpinner, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NotFound from '@/app/not-found';
import LoadingArticle from '@/components/ArticleBuilder/LoadingArticle';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Confirm from '@/components/Confirmation/Confirmation';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import GraphViewModal from '@/components/GraphView/GraphViewModal';
import EditList from '@/components/List/EditList/EditList';
import PublishModal from '@/components/List/EditList/PublishModal/PublishModal';
import ExportBibtexModal from '@/components/List/ExportBibtexModal/ExportBibtexModal';
import HistoryModal from '@/components/List/HistoryModal/HistoryModal';
import useList from '@/components/List/hooks/useList';
import ViewList from '@/components/List/ViewList/ViewList';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const List = () => {
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenExportBibtexModal, setIsOpenExportBibtexModal] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);

    const { list, isLoading, isValidating, error } = useList();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const isLoadingInline = isLoading || isValidating;
    const version = list?.versions.published.find((_version) => _version.id === id);
    const publicationDate = version ? dayjs(version.created_at).format('DD MMMM YYYY') : null;
    const versionNumber = list?.versions.published.length
        ? list.versions.published.length - list.versions.published.findIndex((_version) => _version.id === id)
        : null;

    useEffect(() => {
        let title = 'List - ORKG';
        if (list?.title) {
            title = `${list?.title} - List - ORKG`;
        }
        document.title = title;
    }, [list?.title]);

    if (isLoading) {
        return <LoadingArticle />;
    }

    if (error) {
        return <NotFound />;
    }

    if (!list) {
        return null;
    }

    const handleEdit = async () => {
        if (list.published) {
            const isConfirmed = await Confirm({
                title: 'This is a published list',
                message:
                    'The list you are viewing is published, which means it cannot be modified. To make changes, fetch the live data and try this action again',
                proceedLabel: 'Fetch live data',
            });

            if (isConfirmed) {
                router.push(reverse(ROUTES.LIST, { id: list.versions.head.id }));
            }
        } else {
            toggleIsEditMode();
        }
    };

    return (
        <div>
            {list.research_fields?.[0] && <Breadcrumbs researchFieldId={list.research_fields?.[0]?.id} />}
            <TitleBar
                titleAddition={
                    publicationDate && (
                        <Tooltip content={`Update message: "${version?.changelog}"`}>
                            <SubTitle className=" mt-1">
                                Published on <time dateTime={version?.created_at}>{publicationDate}</time> - Version {versionNumber}
                            </SubTitle>
                        </Tooltip>
                    )
                }
                buttonGroup={
                    <>
                        {isEditMode && (
                            <div
                                color="light-darker"
                                className="inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-default text-dark hover:bg-background focus:ring-default text-xs px-2 py-0 flex"
                                style={{ cursor: 'default' }}
                            >
                                {isLoadingInline ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-secondary" />
                                ) : (
                                    <Tooltip content="All changes are saved">
                                        <span>
                                            <FontAwesomeIcon
                                                icon={faCheckCircle}
                                                className="text-secondary"
                                                style={{ fontSize: '140%', verticalAlign: 'middle' }}
                                                aria-label="All changes are saved"
                                            />
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                        )}

                        {!isEditMode ? (
                            <>
                                <Button
                                    className="shrink-0 button--orkg-secondary"
                                    size="sm"
                                    onPress={() => setIsOpenHistoryModal(true)}
                                    aria-label="View article history"
                                >
                                    <FontAwesomeIcon icon={faHistory} /> History
                                </Button>

                                <RequireAuthentication component={Button} className="shrink-0 button--orkg-secondary" size="sm" onPress={handleEdit}>
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                            </>
                        ) : (
                            <>
                                <Button className="shrink-0 button--orkg-secondary" size="sm" onPress={() => setIsOpenPublishModal(true)}>
                                    <FontAwesomeIcon icon={faUpload} /> Publish
                                </Button>
                                <Button className="shrink-0 button--orkg-secondary" size="sm" onPress={() => toggleIsEditMode()}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            </>
                        )}
                        <Dropdown>
                            <Button size="sm" className="button--orkg-secondary px-4 rounded-r" isIconOnly aria-label="More options">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </Button>
                            <Dropdown.Popover placement="bottom end">
                                <Dropdown.Menu
                                    aria-label="Options"
                                    onAction={(key) => {
                                        if (key === 'export-bibtex') setIsOpenExportBibtexModal(true);
                                        if (key === 'view-graph') setIsOpenGraphViewModal(true);
                                    }}
                                >
                                    <Dropdown.Item id="export-bibtex" textValue="Export as BibTeX">
                                        Export as BibTeX
                                    </Dropdown.Item>
                                    <Dropdown.Item id="view-graph" textValue="View graph">
                                        View graph
                                    </Dropdown.Item>
                                    <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`} textValue="View resource">
                                        View resource
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
                    </>
                }
            >
                List
            </TitleBar>
            <EditModeHeader isVisible={isEditMode} />
            {!isEditMode && <ViewList setIsOpenHistoryModal={setIsOpenHistoryModal} />}
            {isEditMode && <EditList />}
            {isOpenPublishModal && <PublishModal toggle={() => setIsOpenPublishModal((v) => !v)} show />}
            {isOpenHistoryModal && <HistoryModal toggle={() => setIsOpenHistoryModal((v) => !v)} id={id} />}
            {isOpenExportBibtexModal && <ExportBibtexModal toggle={() => setIsOpenExportBibtexModal((v) => !v)} />}
            {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={id} />}
        </div>
    );
};

export default List;
