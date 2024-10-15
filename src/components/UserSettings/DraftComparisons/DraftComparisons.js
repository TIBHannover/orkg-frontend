import { faAngleDoubleLeft, faAngleDoubleRight, faCalendar, faClock, faPen, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { getComparisonURLFromConfig } from 'components/Comparison/hooks/helpers';
import Confirm from 'components/Confirmation/Confirmation';
import Link from 'next/link';
import EditTitleModal from 'components/UserSettings/DraftComparisons/EditTitleModal';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import THING_TYPES from 'constants/thingTypes';
import moment from 'moment';
import { reverse } from 'named-urls';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button, ButtonGroup, ListGroup, ListGroupItem } from 'reactstrap';
import { deleteResource, getResources } from 'services/backend/resources';
import { getThing } from 'services/similarity';

const DraftComparisons = () => {
    const [draftComparisons, setDraftComparisons] = useState([]);
    const [page, setPage] = useState(0);
    const [isLast, setIsLast] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editDraftComparison, setEditDraftComparison] = useState(null);
    const [isOpenEditModal, setIsOpenEditModal] = useState(null);
    const userId = useSelector((state) => state.auth.user.id);

    useEffect(() => {
        document.title = 'Draft comparisons - ORKG';
    });

    const getDraftComparisons = useCallback(async () => {
        setIsLoading(true);
        const { content: _draftComparisons, last } = await getResources({
            include: [CLASSES.COMPARISON_DRAFT],
            page,
            size: 10,
            sortBy: [{ property: 'created_at', direction: 'desc' }],
            created_by: userId,
        });

        let draftComparisonUrls = await Promise.all(
            _draftComparisons.map((draftComparison) =>
                getThing({ thingType: THING_TYPES.DRAFT_COMPARISON, thingKey: draftComparison.id }).catch(() => null),
            ),
        );
        draftComparisonUrls = draftComparisonUrls.filter((result) => result);
        setIsLast(last);
        setDraftComparisons(
            draftComparisonUrls.map((draftComparison) => ({
                ...draftComparison,
                ..._draftComparisons.find((dc) => dc.id === draftComparison.thing_key),
            })),
        );

        setIsLoading(false);
    }, [page, userId]);

    useEffect(() => {
        getDraftComparisons();
    }, [getDraftComparisons, page]);

    const handleDelete = async (id) => {
        const isConfirmed = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure to delete this draft comparison? If the comparison is published already, the comparison remains available',
        });

        if (isConfirmed) {
            setIsLoading(true);
            try {
                await deleteResource(id);
                getDraftComparisons();
                toast.success('Draft comparison has been deleted successfully');
            } catch (e) {
                setIsLoading(false);
                console.error(e);
                toast.error('Error deleting draft comparison');
            }
        }
    };

    const handleChange = ({ title, editItem }) =>
        setDraftComparisons((comparisons) =>
            comparisons.map((draftComparison) => (draftComparison.id === editItem.id ? { ...draftComparison, label: title } : draftComparison)),
        );

    const handleEdit = (draftComparison) => {
        setEditDraftComparison(draftComparison);
        setIsOpenEditModal(true);
    };

    return (
        <>
            <div className="box rounded pt-4 pb-3 px-4 mb-3">
                <h2 className="h5">View draft comparisons</h2>
                <Alert color="info" className="mt-3" fade={false}>
                    Comparisons can be saved as draft if you do not want to publish it yet. If you want to save a comparison as draft, first make a
                    comparison. Click <em>Actions...</em> in the right top of the page, finally click on <em>Save as draft</em>
                </Alert>
            </div>
            {(draftComparisons.length > 0 || isLoading) && (
                <ListGroup className="mb-3 box">
                    {draftComparisons.map((draftComparison) => (
                        <ListGroupItem key={draftComparison.id} className="d-flex justify-content-between align-items-center px-4 py-3">
                            <div>
                                <Link href={reverse(ROUTES.COMPARISON_NOT_PUBLISHED) + getComparisonURLFromConfig(draftComparison.config)}>
                                    {draftComparison.label}
                                </Link>{' '}
                                <br />
                                <small>
                                    <Icon icon={faCalendar} /> {moment(draftComparison.created_at).format('DD MMMM YYYY')}{' '}
                                    <Icon icon={faClock} className="ms-2 me-1" />
                                    {moment(draftComparison.created_at).format('H:mm')}
                                </small>
                            </div>
                            <div className="flex-shrink-0">
                                <ButtonGroup>
                                    <Button
                                        color="light"
                                        size="sm"
                                        className="py-0 px-2 text-secondary"
                                        style={{ marginRight: 2 }}
                                        onClick={() => handleEdit(draftComparison)}
                                    >
                                        <Icon icon={faPen} />
                                    </Button>
                                    <Button
                                        color="light"
                                        size="sm"
                                        className="py-0 px-2 text-danger"
                                        onClick={() => handleDelete(draftComparison.id)}
                                    >
                                        <Icon icon={faTrash} />
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </ListGroupItem>
                    ))}
                    {!isLoading && (page > 0 || !isLast) && (
                        <ListGroupItem className="d-flex justify-content-between">
                            <Button color="light" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                                <Icon icon={faAngleDoubleLeft} />
                            </Button>
                            <Button color="light" size="sm" disabled={isLast} onClick={() => setPage((p) => p + 1)}>
                                <Icon icon={faAngleDoubleRight} />
                            </Button>
                        </ListGroupItem>
                    )}
                    {isLoading && (
                        <ListGroupItem className="text-center">
                            <Icon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}
                </ListGroup>
            )}
            {draftComparisons.length === 0 && !isLoading && <Alert color="info">You have no saved draft comparisons yet</Alert>}
            {isOpenEditModal && (
                <EditTitleModal
                    isOpen={isOpenEditModal}
                    toggle={() => setIsOpenEditModal((v) => !v)}
                    onChange={handleChange}
                    editItem={editDraftComparison}
                />
            )}
        </>
    );
};

DraftComparisons.propTypes = {};

export default DraftComparisons;
