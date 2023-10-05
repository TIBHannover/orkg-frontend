import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import AuthorsModal from 'components/Review/AuthorsModal';
import { SectionStyled, SectionTypeStyled } from 'components/ArticleBuilder/styled';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';

const AuthorsSection = () => {
    const authorResources = useSelector(state => state.review.authorResources);
    const [showModal, setShowModal] = useState(false);

    return (
        <SectionStyled className="box rounded py-3">
            <SectionTypeStyled disabled>
                <Tippy hideOnClick={false} content="The type of the authors cannot be changed">
                    <span>authors</span>
                </Tippy>
            </SectionTypeStyled>
            <AuthorBadges authors={authorResources} />
            <Button size="sm" color="secondary" className="ms-2" onClick={() => setShowModal(true)} aria-label="Edit article authors">
                <Icon icon={faPen} /> Edit authors
            </Button>

            <AuthorsModal show={showModal} toggle={() => setShowModal(v => !v)} />
        </SectionStyled>
    );
};

export default AuthorsSection;
