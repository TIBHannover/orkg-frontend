import { updateAuthors } from 'slices/reviewSlice';
import AuthorsInput from 'components/AuthorsInput/AuthorsInput';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { updateAuthors as updateAuthorsHelper } from 'components/AuthorsInput/helpers';

const AuthorsModal = props => {
    const { show, toggle } = props;
    const [authors, setAuthors] = useState([]);
    const authorResources = useSelector(state => state.review.authorResources);
    const paper = useSelector(state => state.review.paper);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!show) {
            return;
        }
        const _authors = authorResources;
        setAuthors(_authors);
    }, [show, authorResources]);

    const onChange = _authors => {
        setAuthors(_authors);
    };

    const handleSave = async () => {
        const _authors = await updateAuthorsHelper({ prevAuthors: authorResources, newAuthors: authors, resourceId: paper.id });
        dispatch(updateAuthors(_authors));
        toggle();
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Article authors</ModalHeader>
            <ModalBody>
                <AuthorsInput value={authors} handler={onChange} />
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
