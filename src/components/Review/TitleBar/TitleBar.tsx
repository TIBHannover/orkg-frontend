import {
    faCheckCircle,
    faDownload,
    faEllipsisV,
    faHistory,
    faPen,
    faQuoteRight,
    faSpinner,
    faTimes,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import { Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';

import Confirm from '@/components/Confirmation/Confirmation';
import ExportCitation from '@/components/ExportCitation/ExportCitation';
import Tooltip from '@/components/FloatingUI/Tooltip';
import GraphViewModal from '@/components/GraphView/GraphViewModal';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import PublishModal from '@/components/Review/EditReview/PublishModal/PublishModal';
import ReferencesModal from '@/components/Review/EditReview/ReferencesModal/ReferencesModal';
import ShouldPublishModal from '@/components/Review/EditReview/ShouldPublishModal/ShouldPublishModal';
import HistoryModal from '@/components/Review/HistoryModal/HistoryModal';
import useReview from '@/components/Review/hooks/useReview';
import { SubTitle } from '@/components/styled';
import TitleBarOriginal from '@/components/TitleBar/TitleBar';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

type TitleBarProps = {
    isOpenHistoryModal: boolean;
    setIsOpenHistoryModal: Dispatch<SetStateAction<boolean>>;
};
const TitleBar: FC<TitleBarProps> = ({ isOpenHistoryModal, setIsOpenHistoryModal }) => {
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenShouldPublishModal, setIsOpenShouldPublishModal] = useState(false);
    const [isOpenReferencesModal, setIsOpenReferencesModal] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [showExportCitation, setShowExportCitation] = useState(false);

    const { review, isLoading, isValidating } = useReview();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const prevIsEditing = usePrevious(isEditMode);
    const prevIsOpenPublishModal = usePrevious(isOpenPublishModal);
    const router = useRouter();

    const isLoadingInline = isLoading || isValidating;

    const version = review?.versions.published.find((_version) => _version.id === review?.id);
    const publicationDate = version ? dayjs(version.created_at)?.format('DD MMMM YYYY') : null;
    const versionNumber = review?.versions.published.length
        ? review.versions.published.length - review.versions.published.findIndex((_version) => _version.id === review?.id)
        : null;

    useEffect(() => {
        if (prevIsEditing && !isEditMode && !prevIsOpenPublishModal) {
            setIsOpenShouldPublishModal(true);
        }
    }, [isEditMode, prevIsEditing, prevIsOpenPublishModal]);

    const handleEdit = async () => {
        if (review?.published) {
            const isConfirmed = await Confirm({
                title: 'This is a published review',
                message:
                    'The review you are viewing is published, which means it cannot be modified. To make changes, fetch the live review data and try this action again',
                proceedLabel: 'Fetch live data',
            });

            if (isConfirmed) {
                router.push(reverse(ROUTES.REVIEW, { id: review.versions.head.id }));
            }
        } else {
            toggleIsEditMode();
        }
    };

    if (!review) {
        return null;
    }

    return (
        <>
            <TitleBarOriginal
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
                            <div color="light-darker" className="btn btn-light-darker btn-sm px-2" style={{ cursor: 'default' }}>
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
                        {!isEditMode && (
                            <Button
                                className="flex-shrink-0"
                                color="secondary"
                                size="sm"
                                style={{ marginRight: 2 }}
                                onClick={() => window?.print()}
                                aria-label="Print article"
                            >
                                <FontAwesomeIcon icon={faDownload} />
                            </Button>
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
                                    onClick={() => setIsOpenReferencesModal(true)}
                                    aria-label="Manage article references"
                                >
                                    <FontAwesomeIcon icon={faQuoteRight} /> References
                                </Button>
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
                                <DropdownItem onClick={() => setShowExportCitation((v) => !v)}>Export citation</DropdownItem>
                                <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                                <DropdownItem tag={Link} end="true" href={`${reverse(ROUTES.RESOURCE, { id: review?.id })}?noRedirect`}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </>
                }
            >
                Review
            </TitleBarOriginal>
            {isOpenPublishModal && <PublishModal toggle={() => setIsOpenPublishModal((v) => !v)} />}
            {isOpenHistoryModal && <HistoryModal toggle={() => setIsOpenHistoryModal((v) => !v)} id={review?.id} />}
            {isOpenReferencesModal && <ReferencesModal toggle={() => setIsOpenReferencesModal((v) => !v)} />}
            {isOpenShouldPublishModal && (
                <ShouldPublishModal toggle={() => setIsOpenShouldPublishModal((v) => !v)} openPublishModal={() => setIsOpenPublishModal(true)} />
            )}
            {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={review?.id} />}
            {showExportCitation && (
                <ExportCitation
                    id={review?.id}
                    title={review.title}
                    authors={review.authors.map((author) => author?.name)}
                    classId={CLASSES.SMART_REVIEW_PUBLISHED}
                    isOpen={showExportCitation}
                    toggle={() => setShowExportCitation((v) => !v)}
                />
            )}
        </>
    );
};

export default TitleBar;
