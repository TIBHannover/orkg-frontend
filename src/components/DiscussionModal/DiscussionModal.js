import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import Comment from 'components/DiscussionModal/Comment';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createComment, getDiscussionsByEntityId } from 'services/backend/discussions';
import { login } from 'services/keycloak';

const DiscussionModal = ({ entityId, toggle, refreshCount }) => {
    const [comments, setComments] = useState([]);
    const [commentValue, setCommentValue] = useState('');
    const [isLoadingCreate, setIsLoadingCreate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [isLast, setIsLast] = useState(true);
    const listRef = useRef(null);
    const userId = useSelector((state) => state.auth.user?.id);
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const { content, last } = await getDiscussionsByEntityId({ entityId, page });
                setComments((prevComments) => [...prevComments, ...content]);
                setIsLast(last);
            } catch (e) {
                toast.error('Error while loading comments');
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [entityId, page]);

    const handleSubmit = async () => {
        if (commentValue.trim() === '') {
            toast.error('Please enter a comment');
            return;
        }
        try {
            setIsLoadingCreate(true);
            const comment = await createComment({ entityId, message: commentValue });
            setComments((prevComments) => [comment, ...prevComments]);
            setCommentValue('');
            toast.success('Comment created successfully');
            refreshCount();
            listRef.current?.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
        } catch (e) {
            if (e.status === 403) {
                toast.error('Your message cannot contain links to external websites. Please remove the link(s) and try it again.');
            } else {
                toast.error('Error while creating comment');
            }
            console.log(e);
        } finally {
            setIsLoadingCreate(false);
        }
    };

    const handleLoadMore = () => {
        setPage((prevPage) => prevPage + 1);
    };

    const handleSignIn = () => {
        login();
    };

    return (
        <Modal size="lg" isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>Discussion</ModalHeader>
            <ModalBody>
                <ul className="p-0 m-0" ref={listRef}>
                    {comments.map((comment) => (
                        <Comment key={comment.id} comment={comment} entityId={entityId} setComments={setComments} refreshCount={refreshCount} />
                    ))}
                </ul>

                {isLoading && comments.length === 0 && (
                    <ContentLoader height="100%" width="100%" viewBox="0 0 100 35" style={{ width: '100% !important' }} speed={2}>
                        <circle cx="3" cy="3" r="2" />
                        <rect x="6" y="0" rx="1" ry="1" width="94" height="10" />
                        <circle cx="3" cy="15" r="2" />
                        <rect x="6" y="12" rx="1" ry="1" width="94" height="10" />
                        <circle cx="3" cy="27" r="2" />
                        <rect x="6" y="24" rx="1" ry="1" width="94" height="10" />
                    </ContentLoader>
                )}

                {!isLast && (
                    <div className="text-center">
                        <Button color="light" size="sm" disabled={isLoading} onClick={handleLoadMore}>
                            {!isLoading ? (
                                'Load more'
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {!isLoading && comments.length === 0 && (
                    <Alert color="info" className="m-0">
                        No comments yet, add your comment below
                    </Alert>
                )}
            </ModalBody>
            {!isLoading && (
                <ModalFooter>
                    {userId ? (
                        <>
                            <div className="d-flex mb-1 w-100">
                                <div className="m-2">
                                    <UserAvatar userId={userId} />
                                </div>
                                <Input
                                    type="textarea"
                                    placeholder="Write your comment"
                                    value={commentValue}
                                    disabled={isLoadingCreate}
                                    onChange={(e) => setCommentValue(e.target.value)}
                                    rows="3"
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            </div>
                            <ButtonWithLoading color="secondary" size="sm" isLoading={isLoadingCreate} onClick={handleSubmit}>
                                Submit
                            </ButtonWithLoading>
                        </>
                    ) : (
                        <div>
                            Sign in to write a comment{' '}
                            <Button color="secondary" size="sm" className="ms-1" onClick={handleSignIn}>
                                Sign in
                            </Button>
                        </div>
                    )}
                </ModalFooter>
            )}
        </Modal>
    );
};
DiscussionModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    refreshCount: PropTypes.func,
    entityId: PropTypes.string.isRequired,
};

export default DiscussionModal;
