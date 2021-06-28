import { faArrowDown, faArrowUp, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { deleteSection, updateSectionTitle } from 'actions/smartReview';
import AddSection from 'components/SmartReview/AddSection';
import SectionContentLink from 'components/SmartReview/SectionContentLink';
import SectionOntology from 'components/SmartReview/DataTable/SectionOntology';
import SectionMarkdown from 'components/SmartReview/SectionMarkdown';
import SectionType from 'components/SmartReview/SectionType';
import { DeleteButton, MoveHandle, MoveButton, SectionStyled, EditableTitle } from 'components/SmartReview/styled';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import Confirm from 'reactstrap-confirm';
import Tippy from '@tippyjs/react';
import { Button } from 'reactstrap';

const Section = props => {
    const [isHovering, setIsHovering] = useState(false);
    const { type, markdown, title: titleProp } = props.section;
    const sectionId = titleProp.id;
    const [title, setTitle] = useState(titleProp.label);
    const dispatch = useDispatch();

    const SortableHandle = sortableHandle(() => (
        <MoveHandle className={isHovering ? 'hover' : ''}>
            <Icon icon={faBars} />
        </MoveHandle>
    ));

    const handleBlurTitle = e => {
        dispatch(
            updateSectionTitle({
                sectionId,
                title: e.target.value
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
            dispatch(deleteSection(sectionId));
        }
    };

    let sectionType = null;
    if (type.id === CLASSES.RESOURCE_SECTION) {
        sectionType = 'resource';
    } else if (type.id === CLASSES.PROPERTY_SECTION) {
        sectionType = 'property';
    } else if (type.id === CLASSES.COMPARISON_SECTION) {
        sectionType = 'comparison';
    } else if (type.id === CLASSES.VISUALIZATION_SECTION) {
        sectionType = 'visualization';
    } else if (type.id === CLASSES.ONTOLOGY_SECTION) {
        sectionType = 'ontology';
    }

    const isContentLinkSection = ['resource', 'property', 'comparison', 'visualization'].includes(sectionType);
    const isOntologySection = sectionType === 'ontology';

    return (
        <section>
            <SectionStyled className="box rounded" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <DeleteButton className={isHovering ? 'hover' : ''} color="primary" onClick={handleDelete}>
                    <Icon icon={faTimes} />
                </DeleteButton>
                <SortableHandle />
                <MoveButton className={isHovering ? 'hover up' : 'up'}>
                    <Tippy content="Move up">
                        <span>
                            <Button
                                className="p-0 w-100"
                                color="secondary"
                                onClick={() => props.handleManualSort({ id: sectionId, direction: 'up' })}
                            >
                                <Icon icon={faArrowUp} />
                            </Button>
                        </span>
                    </Tippy>
                </MoveButton>
                <MoveButton className={isHovering ? 'hover down' : 'down'}>
                    <Tippy content="Move down">
                        <span>
                            <Button
                                className="p-0 w-100"
                                color="secondary"
                                onClick={() => props.handleManualSort({ id: sectionId, direction: 'down' })}
                            >
                                <Icon icon={faArrowDown} />
                            </Button>
                        </span>
                    </Tippy>
                </MoveButton>
                <SectionType type={type.id} sectionId={sectionId} isDisabled={isContentLinkSection || isOntologySection} />
                <h2 id={`section-${sectionId}`} className="h4 border-bottom pb-1 mb-3" placeholder="trd">
                    <EditableTitle
                        value={title}
                        className="focus-primary"
                        onChange={e => setTitle(e.target.value)}
                        onBlur={handleBlurTitle}
                        placeholder="Enter a section title..."
                        resize="false"
                    />
                </h2>

                {isContentLinkSection && <SectionContentLink section={props.section} type={sectionType} index={props.atIndex} />}

                {isOntologySection && <SectionOntology section={props.section} type={sectionType} isEditable />}

                {!isContentLinkSection && !isOntologySection && markdown && <SectionMarkdown markdown={markdown} />}
            </SectionStyled>
            <AddSection index={props.atIndex} />
        </section>
    );
};

Section.propTypes = {
    section: PropTypes.object.isRequired,
    atIndex: PropTypes.number.isRequired,
    handleManualSort: PropTypes.func.isRequired
};

export default SortableElement(Section);
