import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import EditAuthorsModal from 'components/List/EditAuthorsModal';
import EditResearchField from 'components/List/EditResearchField';
import { EditableTitle, SectionStyled } from 'components/ArticleBuilder/styled';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { updateTitle } from 'slices/listSlice';
import ListEntryAmount from 'components/List/ListEntryAmount/ListEntryAmount';

const EditMetadata = () => {
    const { id, title: titleStore } = useSelector(state => state.list.list);
    const authorResources = useSelector(state => state.list.authorResources);
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');

    useEffect(() => {
        setTitle(titleStore);
    }, [titleStore]);

    const handleBlur = e => {
        if (titleStore !== e.target.value) {
            dispatch(
                updateTitle({
                    id,
                    title: e.target.value,
                }),
            );
        }
    };

    const [showModal, setShowModal] = useState(false);

    return (
        <SectionStyled className="box rounded-bottom">
            <h1 className="py-2 m-0">
                <EditableTitle
                    className="focus-primary"
                    value={title}
                    onBlur={handleBlur}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter a title..."
                />
            </h1>

            <EditResearchField />
            <ListEntryAmount />
            <AuthorBadges authors={authorResources} />

            <Button size="sm" color="secondary" className="ms-2" onClick={() => setShowModal(true)} aria-label="Edit article authors">
                <Icon icon={faPen} /> Edit
            </Button>

            <EditAuthorsModal show={showModal} toggle={() => setShowModal(v => !v)} />
        </SectionStyled>
    );
};

export default EditMetadata;
