import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import AuthorsInput from 'components/Input/AuthorsInput/AuthorsInput';
import { createAuthorsList, updateAuthorsList } from 'components/Input/AuthorsInput/helpers';
import { AuthorTag } from 'components/Input/AuthorsInput/styled';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { authorsUpdated, listLoaded } from 'slices/listSlice';
import { convertAuthorsToNewFormat, convertAuthorsToOldFormat } from 'utils';

const EditAuthorsModal = (props) => {
    const { show, toggle } = props;
    const [authors, setAuthors] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const authorResources = useSelector((state) => state.list.authorResources);
    const authorListResource = useSelector((state) => state.list.authorListResource);
    const list = useSelector((state) => state.list.list);

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
            setIsSaving(true);
            let _authors = [];
            if (authorListResource?.id) {
                _authors = await updateAuthorsList({ prevAuthors: authorResources, newAuthors: authors, listId: authorListResource?.id });
            } else {
                const newList = await createAuthorsList({ authors, resourceId: list.id });
                _authors = newList?.authors;
                dispatch(listLoaded({ authorListResource: newList.list }));
            }
            dispatch(authorsUpdated(_authors));
            setIsSaving(false);
            toggle();
            toast.success('Authors saved successfully');
        } catch {
            toast.error('An error occurred while saving the authors');
        }
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>List authors</ModalHeader>
            <ModalBody>
                {isSaving &&
                    authors.map((author, index) => (
                        <AuthorTag key={`creator${index}`}>
                            <div className="name"> {author.label} </div>
                        </AuthorTag>
                    ))}
                {!isSaving && (
                    <AuthorsInput value={convertAuthorsToNewFormat(authors)} handler={(_authors) => onChange(convertAuthorsToOldFormat(_authors))} />
                )}
            </ModalBody>
            <ModalFooter>
                <ButtonWithLoading isLoading={isSaving} loadingMessage="Saving" color="primary" onClick={handleSave}>
                    Save
                </ButtonWithLoading>
            </ModalFooter>
        </Modal>
    );
};

EditAuthorsModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
};

export default EditAuthorsModal;
