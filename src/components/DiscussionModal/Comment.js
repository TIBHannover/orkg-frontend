import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Confirm from 'components/Confirmation/Confirmation';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { getContributorInformationById } from 'services/backend/contributors';
import { deleteComment } from 'services/backend/discussions';

const Comment = ({ comment, entityId, setComments, refreshCount }) => {
    const [username, setUsername] = useState('');
    const userId = useSelector(state => state.auth.user?.id);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    useEffect(() => {
        (async () => {
            setUsername((await getContributorInformationById(comment.created_by)).display_name);
        })();
    }, [comment.created_by]);

    const handleDeleteComment = async commentId => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'You are about the remove this comment.',
        });

        if (confirm) {
            try {
                await deleteComment({ entityId, commentId });
                setComments(prevComments => prevComments.filter(_comment => _comment.id !== commentId));
                refreshCount();
                toast.success('Comment deleted successfully');
            } catch (e) {
                toast.error('Error while deleting comment');
                console.log(e);
            }
        }
    };

    return (
        <li key={comment.id} className="d-flex mb-3">
            <div className="m-2">
                <UserAvatar userId={comment.created_by} />
            </div>
            <div className="bg-light py-2 px-3 flex-grow-1 rounded">
                <div className="d-flex justify-content-between">
                    <small className="text-muted">
                        <Link to={reverse(ROUTES.USER_PROFILE, { userId: comment.created_by })} target="_blank" className="fw-bold text-black">
                            {username}
                        </Link>{' '}
                        {moment(comment.created_at).fromNow()}
                    </small>
                    {(comment.created_by === userId || isCurationAllowed) && (
                        <Button color="link" className="p-0" onClick={() => handleDeleteComment(comment.id)}>
                            <Icon icon={faTrash} className="text-secondary" />
                        </Button>
                    )}
                </div>
                <p className="my-1 text-black" style={{ whiteSpace: 'pre-line' }}>
                    {comment.message}
                </p>
            </div>
        </li>
    );
};
Comment.propTypes = {
    comment: PropTypes.object.isRequired,
    entityId: PropTypes.string.isRequired,
    setComments: PropTypes.func.isRequired,
    refreshCount: PropTypes.func.isRequired,
};

export default Comment;
