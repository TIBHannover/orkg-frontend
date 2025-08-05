'use client';

import { faCheckCircle, faEllipsisV, faHistory, faPen, faSpinner, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
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
import Button from '@/components/Ui/Button/Button';
import UncontrolledButtonDropdown from '@/components/Ui/Button/UncontrolledButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';

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
                                className="btn btn-light-darker btn-sm px-2 py-0 align-items-center d-flex"
                                style={{ cursor: 'default', marginRight: 2 }}
                            >
                                {isLoadingInline ? (
                                    <FontAwesomeIcon icon={faSpinner} spin className="me-2 text-secondary" />
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
                                    className="flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
                                    onClick={() => setIsOpenHistoryModal(true)}
                                    aria-label="View article history"
                                >
                                    <FontAwesomeIcon icon={faHistory} /> History
                                </Button>

                                <RequireAuthentication
                                    component={Button}
                                    className="flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
                                    onClick={handleEdit}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                            </>
                        ) : (
                            <>
                                <Button
                                    className="flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
                                    onClick={() => setIsOpenPublishModal(true)}
                                >
                                    <FontAwesomeIcon icon={faUpload} /> Publish
                                </Button>
                                <Button
                                    className="flex-shrink-0"
                                    active
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
                                    onClick={() => toggleIsEditMode()}
                                >
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            </>
                        )}
                        <UncontrolledButtonDropdown>
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end="true">
                                <DropdownItem onClick={() => setIsOpenExportBibtexModal(true)}>Export as BibTeX</DropdownItem>
                                <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                                <DropdownItem tag={Link} href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
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
