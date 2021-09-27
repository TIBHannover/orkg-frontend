import { deleteSection, updateSectionTitle } from 'actions/smartReview';
import AddSection from 'components/SmartReview/AddSection';
import SectionOntology from 'components/SmartReview/DataTable/SectionOntology';
import SectionContentLink from 'components/SmartReview/SectionContentLink';
import SectionMarkdown from 'components/SmartReview/SectionMarkdown';
import SectionType from 'components/SmartReview/SectionType';
import { EditableTitle } from 'components/SmartReview/styled';
import SortableSection from 'components/SortableSection/SortableSection';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SortableElement } from 'react-sortable-hoc';
import Confirm from 'reactstrap-confirm';

const Section = props => {
    const { type, markdown, title: titleProp } = props.section;
    const sectionId = titleProp.id;
    const [title, setTitle] = useState(titleProp.label);
    const dispatch = useDispatch();

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

                {!isContentLinkSection && !isOntologySection && markdown && <SectionMarkdown markdown={markdown} />}
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
