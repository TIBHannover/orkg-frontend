import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import { deleteSection, updateSectionMarkdown, updateSectionTitle } from 'actions/smartArticle';
import AddSection from 'components/SmartArticle/AddSection';
import SectionType from 'components/SmartArticle/SectionType';
import { ContentEditableStyled, DeleteButton, MoveHandle, SectionStyled } from 'components/SmartArticle/styled';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { SortableElement, sortableHandle } from 'react-sortable-hoc';
import Textarea from 'react-textarea-autosize';
import Confirm from 'reactstrap-confirm';
import * as Showdown from 'showdown';

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

const Section = props => {
    const [markdownValue, setMarkdownValue] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const { type, markdown, title } = props.section;
    const dispatch = useDispatch();
    const markdownEditorRef = useRef(null);
    const text = useRef('');

    const SortableHandle = sortableHandle(() => (
        <MoveHandle className={isHovering ? 'hover' : ''}>
            <Icon icon={faBars} />
        </MoveHandle>
    ));

    // initial data loading
    useEffect(() => {
        if (!title) {
            return;
        }
        text.current = title.label;
    }, [title]);

    // initial data loading
    useEffect(() => {
        if (!markdown) {
            return;
        }
        setMarkdownValue(markdown.label);
    }, [markdown]);

    // set focus to editor when starting edit mode
    useEffect(() => {
        if (editMode) {
            markdownEditorRef.current.focus();
        }
    }, [editMode]);

    const handleChange = evt => {
        text.current = evt.target.value;
    };

    const handleBlurTitle = async () => {
        dispatch(
            updateSectionTitle({
                sectionId: title.id,
                title: text.current
            })
        );
    };

    const handleBlurMarkdown = () => {
        setEditMode(false);

        dispatch(
            updateSectionMarkdown({
                id: markdown.id,
                markdown: markdownValue
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
            console.log('delete', title.id);
            dispatch(deleteSection(title.id));
        }
    };

    return (
        <>
            <SectionStyled className="box rounded" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <DeleteButton className={isHovering ? 'hover' : ''} color="primary" onClick={handleDelete}>
                    <Icon icon={faTimes} />
                </DeleteButton>
                <SortableHandle />
                <SectionType type={type.id} sectionId={title.id} />
                <h2 className="h4 border-bottom pb-1 mb-3" placeholder="trd">
                    <ContentEditableStyled
                        html={text.current}
                        onBlur={handleBlurTitle}
                        onChange={handleChange}
                        placeholder="Enter a section title..."
                    />
                </h2>

                {!editMode ? (
                    <Tippy hideOnClick={false} content="Double click to edit">
                        <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(markdownValue) }} onDoubleClick={() => setEditMode(true)} />
                    </Tippy>
                ) : (
                    <Textarea
                        value={markdownValue}
                        onChange={e => setMarkdownValue(e.target.value)}
                        onBlur={handleBlurMarkdown}
                        className="form-control"
                        inputRef={markdownEditorRef}
                    />
                )}
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
