import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { deleteSection, updateSectionTitle } from 'actions/smartArticle';
import AddSection from 'components/SmartArticle/AddSection';
import ContentEditable from 'components/SmartArticle/ContentEditable';
import SectionMarkdown from 'components/SmartArticle/SectionMarkdown';
import SectionStatementBrowser from 'components/SmartArticle/SectionStatementBrowser';
import SectionType from 'components/SmartArticle/SectionType';
import { DeleteButton, MoveHandle, SectionStyled } from 'components/SmartArticle/styled';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import Confirm from 'reactstrap-confirm';
import SectionComparison from 'components/SmartArticle/SectionComparison';

const Section = props => {
    const [isHovering, setIsHovering] = useState(false);
    const { type, markdown, title } = props.section;
    const dispatch = useDispatch();

    const SortableHandle = sortableHandle(() => (
        <MoveHandle className={isHovering ? 'hover' : ''}>
            <Icon icon={faBars} />
        </MoveHandle>
    ));

    const handleBlurTitle = async text => {
        dispatch(
            updateSectionTitle({
                sectionId: title.id,
                title: text
            })
        );
    };

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this section?',
            cancelColor: 'light'
        });

        if (confirm) {
            dispatch(deleteSection(title.id));
        }
    };

    const isStatementBrowserSection = props.section.type.id === CLASSES.RESOURCE_SECTION || props.section.type.id === CLASSES.PROPERTY_SECTION;
    const isComparisonSection = props.section.type.id === CLASSES.COMPARISON_SECTION;
    const isTypeChangeDisabled = isStatementBrowserSection;

    return (
        <>
            <SectionStyled className="box rounded" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <DeleteButton className={isHovering ? 'hover' : ''} color="primary" onClick={handleDelete}>
                    <Icon icon={faTimes} />
                </DeleteButton>
                <SortableHandle />
                <SectionType type={type.id} sectionId={title.id} isDisabled={isTypeChangeDisabled} />
                <h2 className="h4 border-bottom pb-1 mb-3" placeholder="trd">
                    <ContentEditable text={title.label} onBlur={handleBlurTitle} placeholder="Enter a section title..." />
                </h2>

                {isStatementBrowserSection && (
                    <SectionStatementBrowser
                        section={props.section}
                        type={props.section.type.id === CLASSES.RESOURCE_SECTION ? 'resource' : 'property'}
                    />
                )}

                {isComparisonSection && <SectionComparison id={props?.section?.contentLink?.objectId} />}

                {!isStatementBrowserSection && !isComparisonSection && markdown && <SectionMarkdown markdown={markdown} />}
            </SectionStyled>
            <AddSection index={props.atIndex} />
        </>
    );
};

Section.propTypes = {
    section: PropTypes.object.isRequired,
    atIndex: PropTypes.number.isRequired
};

export default SortableElement(Section);
