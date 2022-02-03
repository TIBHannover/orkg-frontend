import AuthorsInput from 'components/Utils/AuthorsInput';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { authorsUpdated } from 'slices/literatureListSlice';
import { saveAuthors } from 'utils';

const EditAuthorsModal = props => {
    const { show, toggle } = props;
    const [authors, setAuthors] = useState([]);
    const authorResources = useSelector(state => state.literatureList.authorResources);
    const list = useSelector(state => state.literatureList.literatureList);
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
        const _authors = await saveAuthors({ prevAuthors: authorResources, newAuthors: authors, resourceId: list.id });
        dispatch(authorsUpdated(_authors));
        toggle();
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>List authors</ModalHeader>
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

EditAuthorsModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default EditAuthorsModal;
