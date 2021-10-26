import { faAngleDoubleLeft, faAngleDoubleRight, faCalendar, faClock, faPen, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import EditTitleModal from 'components/UserSettings/DraftComparisons/EditTitleModal';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Alert, Badge, Button, ButtonGroup, ListGroup, ListGroupItem } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { deleteResource, getResourcesByClass } from 'services/backend/resources';
import { getResourceData } from 'services/similarity/index';

const DraftComparisons = () => {
    const [draftComparisons, setDraftComparisons] = useState([]);
    const [page, setPage] = useState(0);
    const [isLast, setIsLast] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editDraftComparison, setEditDraftComparison] = useState(null);
    const [isOpenEditModal, setIsOpenEditModal] = useState(null);

    const userId = useSelector(state => state.auth.user.id);

    const getDraftComparisons = useCallback(async () => {
        setIsLoading(true);
        const { content: _draftComparisons, last } = await getResourcesByClass({
            id: CLASSES.COMPARISON_DRAFT,
            page,
            items: 10,
            sortBy: 'created_at',
            creator: userId,
            desc: true
        });
        const draftComparisonUrls = await Promise.all(_draftComparisons.map(draftComparison => getResourceData(draftComparison.id)));
        setIsLast(last);
        setDraftComparisons(_draftComparisons.map((draftComparison, index) => ({ ...draftComparison, url: draftComparisonUrls[index].data.url })));
        setIsLoading(false);
    }, [page, userId]);

    useEffect(() => {
        getDraftComparisons();
    }, [getDraftComparisons, page]);

    const handleDelete = async id => {
        const isConfirmed = await Confirm({
            title: 'Are you sure?',
            message: `Are you sure to delete this draft comparison? If the comparison is published already, the comparison remains available`,
            cancelColor: 'light'
        });

        if (isConfirmed) {
            setIsLoading(true);
            await deleteResource(id);
            getDraftComparisons();
            toast.success('Draft comparison has been deleted successfully');
        }
    };

    const handleChange = ({ title, editItem }) =>
        setDraftComparisons(comparisons =>
            comparisons.map(draftComparison => (draftComparison.id === editItem.id ? { ...draftComparison, label: title } : draftComparison))
        );

    const handleEdit = draftComparison => {
        setEditDraftComparison(draftComparison);
        setIsOpenEditModal(true);
    };

    return (
        <>
            <h2 className="h5 mb-4">Saved draft comparisons</h2>

            <ListGroup className="mb-3">
                {draftComparisons.map(draftComparison => (
                    <ListGroupItem key={draftComparison.id} className="d-flex justify-content-between align-items-center py-2">
                        <Link to={reverse(ROUTES.COMPARISON) + draftComparison.url}>{draftComparison.label}</Link>
                        <div className="flex-shrink-0">
                            <Badge color="light" className="mr-2">
                                <Icon icon={faCalendar} className="text-secondary" /> {moment(draftComparison.created_at).format('DD-MM-YYYY H:mm')}
                            </Badge>
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
                                <Button color="light" size="sm" className="py-0 px-2 text-danger" onClick={() => handleDelete(draftComparison.id)}>
                                    <Icon icon={faTrash} />
                                </Button>
                            </ButtonGroup>
                        </div>
                    </ListGroupItem>
                ))}
                {!isLoading && (page > 0 || !isLast) && (
                    <ListGroupItem className="d-flex justify-content-between">
                        <Button color="light" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            <Icon icon={faAngleDoubleLeft} />
                        </Button>
                        <Button color="light" size="sm" disabled={isLast} onClick={() => setPage(p => p + 1)}>
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

            {draftComparisons.length === 0 && <Alert color="info">You have no saved draft comparisons yet</Alert>}

            {isOpenEditModal && (
                <EditTitleModal
                    isOpen={isOpenEditModal}
                    toggle={() => setIsOpenEditModal(v => !v)}
                    onChange={handleChange}
                    editItem={editDraftComparison}
                />
            )}
        </>
    );
};

DraftComparisons.propTypes = {};

export default DraftComparisons;
