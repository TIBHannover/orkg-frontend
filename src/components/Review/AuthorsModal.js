import AuthorsInput from 'components/Input/AuthorsInput/AuthorsInput';
import { createAuthorsList, updateAuthorsList } from 'components/Input/AuthorsInput/helpers';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { setAuthorListResource, updateAuthors } from 'slices/reviewSlice';
import { convertAuthorsToNewFormat, convertAuthorsToOldFormat } from 'utils';

const AuthorsModal = (props) => {
    const { show, toggle } = props;
    const [authors, setAuthors] = useState([]);
    const authorResources = useSelector((state) => state.review.authorResources);
    const authorListResource = useSelector((state) => state.review.authorListResource);
    const paper = useSelector((state) => state.review.paper);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!show) {
            return;
        }
        const _authors = authorResources;
        setAuthors(_authors);
    }, [show, authorResources]);

    const onChange = (_authors) => {
        setAuthors(_authors);
    };

    const handleSave = async () => {
        try {
            let _authors = [];
            if (authorListResource?.id) {
                _authors = await updateAuthorsList({ prevAuthors: authorResources, newAuthors: authors, listId: authorListResource?.id });
            } else {
                const newList = await createAuthorsList({ authors, resourceId: paper.id });
                _authors = newList?.authors;
                dispatch(setAuthorListResource({ authorListResource: newList.list }));
            }
            dispatch(updateAuthors(_authors));
            toggle();
            toast.success('Authors saved successfully');
        } catch (e) {
            toast.error('An error occurred while saving the authors');
            console.error(e);
        }
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Article authors</ModalHeader>
            <ModalBody>
                <AuthorsInput value={convertAuthorsToNewFormat(authors)} handler={(_authors) => onChange(convertAuthorsToOldFormat(_authors))} />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

AuthorsModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
};

export default AuthorsModal;
