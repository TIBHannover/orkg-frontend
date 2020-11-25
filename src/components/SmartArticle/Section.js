import React, { useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SectionStyled, DeleteButton, MoveHandle, SectionType } from 'components/SmartArticle/styled';
import AddSection from 'components/SmartArticle/AddSection';
import PropTypes from 'prop-types';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

const Section = props => {
    const [isHovering, setIsHovering] = useState(false);
    const type = props.section.classes.find(_class => _class !== CLASSES.SECTION);
    const contentStatement = props.section.statements.find(({ statement }) => statement.predicate.id === PREDICATES.HAS_CONTENT);
    const content = contentStatement.statement.object.label;

    return (
        <>
            <SectionStyled className="box rounded" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <DeleteButton className={isHovering ? 'hover' : ''} color="primary">
                    <Icon icon={faTimes} />
                </DeleteButton>
                <MoveHandle className={isHovering ? 'hover' : ''}>
                    <Icon icon={faBars} />
                </MoveHandle>
                <SectionType>{type}</SectionType>
                <p className="m-0">{content}</p>
            </SectionStyled>
            <AddSection />
        </>
    );
};

Section.propTypes = {
    section: PropTypes.object.isRequired
};

export default Section;
