import { deleteSection, updateSectionMarkdown, updateSectionTitle } from 'slices/reviewSlice';
import AddSection from 'components/Review/AddSection';
import SectionOntology from 'components/Review/DataTable/SectionOntology';
import SectionContentLink from 'components/Review/SectionContentLink';
import SectionType from 'components/Review/SectionType';
import { EditableTitle } from 'components/ArticleBuilder/styled';
import SortableSection from 'components/ArticleBuilder/SortableSection/SortableSection';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableElement } from 'react-sortable-hoc';
import Confirm from 'components/Confirmation/Confirmation';
import MarkdownEditor from 'components/ArticleBuilder/MarkdownEditor/MarkdownEditor';

const Section = props => {
    const { type, markdown, title: titleProp } = props.section;
    const sectionId = titleProp.id;
    const [title, setTitle] = useState(titleProp.label);
    const references = useSelector(state => state.review.references);
    const dispatch = useDispatch();

    const handleBlurTitle = e => {
        dispatch(
            updateSectionTitle({
                sectionId,
                title: e.target.value
            })
        );
    };

    const handleUpdateMarkdown = value => {
        dispatch(
            updateSectionMarkdown({
                id: markdown.id,
                markdown: value
            })
        );
    };

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this section?'
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
            <SortableSection handleDelete={handleDelete} handleSort={direction => props.handleManualSort({ id: sectionId, direction })}>
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

                {!isContentLinkSection && !isOntologySection && markdown && (
                    <MarkdownEditor label={markdown.label} handleUpdate={handleUpdateMarkdown} references={references} literalId={markdown.id} />
                )}
            </SortableSection>
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
