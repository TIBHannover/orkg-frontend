import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EditableTitle, SectionStyled } from 'components/ArticleBuilder/styled';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import EditAuthorsModal from 'components/List/EditList/EditMetadata/EditAuthorsModal/EditAuthorsModal';
import EditResearchField from 'components/List/EditList/EditMetadata/EditResearchField/EditResearchField';
import ListEntryAmount from 'components/List/ListEntryAmount/ListEntryAmount';
import SustainableDevelopmentGoals from 'components/List/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import useList from 'components/List/hooks/useList';
import { FocusEvent, useEffect, useState } from 'react';
import { Button } from 'reactstrap';

const EditMetadata = () => {
    const { list, updateList, isValidating } = useList();
    const [title, setTitle] = useState('');
    const [isOpenAuthorsModal, setIsOpenAuthorsModal] = useState(false);

    useEffect(() => {
        setTitle(list?.title || '');
    }, [list?.title]);

    if (!list) {
        return null;
    }

    const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
        if (list?.title !== e.target.value) {
            updateList({ title: e.target.value });
        }
    };

    return (
        <SectionStyled className="box rounded-bottom">
            <h1 className="py-2 m-0">
                <EditableTitle
                    className="focus-primary"
                    value={title}
                    onBlur={handleBlur}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title..."
                />
            </h1>

            <div className="d-flex justify-content-between">
                <div>
                    <EditResearchField />

                    <ListEntryAmount />
                    <AuthorBadges authors={list.authors} />
                    <Button
                        size="sm"
                        color="secondary"
                        className="ms-2"
                        onClick={() => setIsOpenAuthorsModal(true)}
                        aria-label="Edit article authors"
                    >
                        <FontAwesomeIcon icon={faPen} /> Edit
                    </Button>
                </div>
                <div>
                    <SustainableDevelopmentGoals isEditable />
                </div>
            </div>

            {isOpenAuthorsModal && <EditAuthorsModal toggle={() => setIsOpenAuthorsModal((v) => !v)} />}
        </SectionStyled>
    );
};

export default EditMetadata;
