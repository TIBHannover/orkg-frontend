import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import AuthorsList from 'components/SmartArticle/AuthorsList';
import AuthorsModal from 'components/SmartArticle/AuthorsModal';
import { SectionStyled, SectionTypeStyled } from 'components/SmartArticle/styled';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';

const AuthorsSection = () => {
    const authorResources = useSelector(state => state.smartArticle.authorResources);
    const [showModal, setShowModal] = useState(false);

    return (
        <SectionStyled className="box rounded py-3">
            <SectionTypeStyled disabled>
                <Tippy hideOnClick={false} content="The type of the authors cannot be changed">
                    <span>authors</span>
                </Tippy>
            </SectionTypeStyled>
            <AuthorsList authors={authorResources} />
            <Button size="sm" color="secondary" className="ml-2" onClick={() => setShowModal(true)}>
                <Icon icon={faPen} /> Edit
            </Button>

            <AuthorsModal show={showModal} toggle={() => setShowModal(v => !v)} />
        </SectionStyled>
    );
};

export default AuthorsSection;
