import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SectionStyled, DeleteButton, MoveHandle, ContentEditableStyled } from 'components/SmartArticle/styled';
import AddSection from 'components/SmartArticle/AddSection';
import PropTypes from 'prop-types';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { updateSectionTitle, updateSectionMarkdown } from 'actions/smartArticle';
import { useDispatch } from 'react-redux';
import * as Showdown from 'showdown';
import Tippy from '@tippy.js/react';
import Textarea from 'react-textarea-autosize';
import SectionType from 'components/SmartArticle/SectionType';

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
                id: title.id,
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

    return (
        <>
            <SectionStyled className="box rounded" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <DeleteButton className={isHovering ? 'hover' : ''} color="primary">
                    <Icon icon={faTimes} />
                </DeleteButton>
                <MoveHandle className={isHovering ? 'hover' : ''}>
                    <Icon icon={faBars} />
                </MoveHandle>
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
            <AddSection />
        </>
    );
};

Section.propTypes = {
    section: PropTypes.object.isRequired
};

export default Section;
