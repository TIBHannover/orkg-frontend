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
import { Button, Dropdown } from '@heroui/react';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';

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
import { reverse } from '@/lib/namedRoute';

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
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
                            <div
                                color="light-darker"
                                className="inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-default text-dark hover:bg-background focus:ring-default py-1.5 text-xs px-2"
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
                        {!isEditMode && (
                            <Button className="button--orkg-secondary shrink-0" size="sm" onPress={() => window?.print()} aria-label="Print article">
                                <FontAwesomeIcon icon={faDownload} />
                            </Button>
                        )}

                        {!isEditMode ? (
                            <>
                                <Button
                                    className="button--orkg-secondary shrink-0"
                                    size="sm"
                                    onPress={() => setIsOpenHistoryModal(true)}
                                    aria-label="View article history"
                                >
                                    <FontAwesomeIcon icon={faHistory} /> History
                                </Button>

                                <RequireAuthentication component={Button} className="button--orkg-secondary shrink-0" size="sm" onClick={handleEdit}>
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                            </>
                        ) : (
                            <>
                                <Button
                                    className="button--orkg-secondary shrink-0"
                                    size="sm"
                                    onPress={() => setIsOpenReferencesModal(true)}
                                    aria-label="Manage article references"
                                >
                                    <FontAwesomeIcon icon={faQuoteRight} /> References
                                </Button>
                                <Button className="button--orkg-secondary shrink-0" size="sm" onPress={() => setIsOpenPublishModal(true)}>
                                    <FontAwesomeIcon icon={faUpload} /> Publish
                                </Button>
                                <Button className="button--orkg-secondary shrink-0" size="sm" onPress={() => toggleIsEditMode()}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            </>
                        )}
                        <Dropdown>
                            <Button size="sm" className="button--orkg-secondary px-4 rounded-r" isIconOnly aria-label="More options">
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </Button>
                            <Dropdown.Popover placement="bottom end">
                                <Dropdown.Menu>
                                    <Dropdown.Item textValue="Export citation" onAction={() => setShowExportCitation((v) => !v)}>
                                        Export citation
                                    </Dropdown.Item>
                                    <Dropdown.Item textValue="View graph" onAction={() => setIsOpenGraphViewModal(true)}>
                                        View graph
                                    </Dropdown.Item>
                                    <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id: review?.id })}?noRedirect`} textValue="View resource">
                                        View resource
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown>
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
                    authors={review.authors.map((author) => {
                        return { literal: author?.name ?? '' };
                    })}
                    classId={CLASSES.SMART_REVIEW_PUBLISHED}
                    isOpen={showExportCitation}
                    toggle={() => setShowExportCitation((v) => !v)}
                />
            )}
        </>
    );
};

export default TitleBar;
