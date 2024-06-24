import AuthorsInput from 'components/Input/AuthorsInput/AuthorsInput';
import useList from 'components/List/hooks/useList';
import { FC, useEffect, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Author } from 'services/backend/types';

type EditAuthorsModalProps = {
    toggle: () => void;
};

const EditAuthorsModal: FC<EditAuthorsModalProps> = ({ toggle }) => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const { list, updateList } = useList();

    useEffect(() => {
        setAuthors(list?.authors || []);
    }, [list?.authors]);

    if (!list) {
        return null;
    }

    const onChange = (_authors: Author[]) => {
        setAuthors(_authors);
    };

    const handleSave = async () => {
        updateList({ authors });
        toggle();
    };

    return (
        <Modal isOpen toggle={toggle}>
            <ModalHeader toggle={toggle}>List authors</ModalHeader>
            <ModalBody>
                <AuthorsInput value={authors} handler={(_authors) => onChange(_authors)} />
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default EditAuthorsModal;
