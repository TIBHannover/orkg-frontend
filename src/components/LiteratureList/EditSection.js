import { deleteSection, updateSectionMarkdown, updateSectionTitle } from 'actions/literatureList';
import MarkdownEditor from 'components/ArticleBuilder/MarkdownEditor/MarkdownEditor';
import SortableSection from 'components/ArticleBuilder/SortableSection/SortableSection';
import { EditableTitle } from 'components/ArticleBuilder/styled';
import AddSection from 'components/LiteratureList/AddSection';
import PaperCard from 'components/LiteratureList/PaperCard';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { SortableElement } from 'react-sortable-hoc';
import { Button, ListGroup } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { faBars, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import EditSectionList from 'components/LiteratureList/EditSectionList';

const EditSection = props => {
    const { type, content, title: titleProp, id } = props.section;
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

    return (
        <section>
            <SortableSection handleDelete={handleDelete} handleSort={direction => props.handleManualSort({ id, direction })}>
                {type !== CLASSES.LIST_SECTION && (
                    <h2 id={`section-${id}`} className="h4 border-bottom pb-1 mb-3" placeholder="trd">
                        <EditableTitle
                            value={title}
                            className="focus-primary"
                            onChange={e => setTitle(e.target.value)}
                            onBlur={handleBlurTitle}
                            placeholder="Enter a section title..."
                            resize="false"
                        />
                    </h2>
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
