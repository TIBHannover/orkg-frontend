import MarkdownEditor from 'components/ArticleBuilder/MarkdownEditor/MarkdownEditor';
import SortableSection from 'components/ArticleBuilder/SortableSection/SortableSection';
import { EditableTitle } from 'components/ArticleBuilder/styled';
import AddSection from 'components/LiteratureList/AddSection';
import EditSectionList from 'components/LiteratureList/EditSectionList';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SortableElement } from 'react-sortable-hoc';
import { Input } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { deleteSection, updateSectionHeadingLevel, updateSectionMarkdown, updateSectionTitle } from 'slices/literatureListSlice';

const EditSection = props => {
    const { type, content, title: titleProp, id, heading } = props.section;
    const [title, setTitle] = useState(titleProp);
    const dispatch = useDispatch();

    const handleBlurTitle = e => {
        dispatch(
            updateSectionTitle({
                sectionId: id,
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
            dispatch(deleteSection(id));
        }
    };

    const handleUpdateMarkdown = markdown => {
        dispatch(
            updateSectionMarkdown({
                id: content.id,
                markdown
            })
        );
    };

    const handleUpdateHeadingLevel = level =>
        dispatch(
            updateSectionHeadingLevel({
                id: heading?.id,
                level
            })
        );

    return (
        <section>
            <SortableSection handleDelete={handleDelete} handleSort={direction => props.handleManualSort({ id, direction })}>
                {type !== CLASSES.LIST_SECTION && (
                    <div className="d-flex align-items-center  border-bottom pb-1 mb-3">
                        <Input
                            aria-label="Select heading level"
                            className="mr-2"
                            type="select"
                            style={{ width: 70 }}
                            value={heading?.level}
                            onChange={e => handleUpdateHeadingLevel(e.target.value)}
                        >
                            <option value="1">H1</option>
                            <option value="2">H2</option>
                            <option value="3">H3</option>
                            <option value="4">H4</option>
                            <option value="5">H5</option>
                            <option value="6">H6</option>
                        </Input>
                        <h2 id={`section-${id}`} className={`h${heading?.level} flex-grow-1 m-0`} placeholder="trd">
                            <EditableTitle
                                value={title}
                                className="focus-primary"
                                onChange={e => setTitle(e.target.value)}
                                onBlur={handleBlurTitle}
                                placeholder="Enter a section title..."
                                resize="false"
                            />
                        </h2>
                    </div>
                )}
                {type === CLASSES.TEXT_SECTION && <MarkdownEditor label={content.text} handleUpdate={handleUpdateMarkdown} />}
                {type === CLASSES.LIST_SECTION && <EditSectionList section={props.section} />}
            </SortableSection>
            <AddSection index={props.atIndex} />
        </section>
    );
};

EditSection.propTypes = {
    section: PropTypes.object.isRequired,
    atIndex: PropTypes.number.isRequired,
    handleManualSort: PropTypes.func.isRequired
};

export default SortableElement(EditSection);
