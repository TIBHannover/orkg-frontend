import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import EditAuthorsModal from 'components/LiteratureList/EditAuthorsModal';
import EditResearchField from 'components/LiteratureList/EditResearchField';
import { EditableTitle, SectionStyled } from 'components/ArticleBuilder/styled';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { updateTitle } from 'slices/literatureListSlice';

const EditTitle = () => {
    const { id, title: titleStore } = useSelector(state => state.literatureList.literatureList);
    const authorResources = useSelector(state => state.literatureList.authorResources);
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');

    useEffect(() => {
        setTitle(titleStore);
    }, [titleStore]);

    const handleBlur = e => {
        dispatch(
            updateTitle({
                id,
                title: e.target.value
            })
        );
    };

    const [showModal, setShowModal] = useState(false);

    return (
        <SectionStyled className="box rounded mb-1">
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
            <AuthorBadges authors={authorResources} />

            <Button size="sm" color="secondary" className="ms-2" onClick={() => setShowModal(true)} aria-label="Edit article authors">
                <Icon icon={faPen} /> Edit
            </Button>

            <EditAuthorsModal show={showModal} toggle={() => setShowModal(v => !v)} />
        </SectionStyled>
    );
};

export default EditTitle;
