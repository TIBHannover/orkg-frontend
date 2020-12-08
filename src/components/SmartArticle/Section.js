import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import { deleteSection, updateSectionMarkdown, updateSectionTitle } from 'actions/smartArticle';
import AddSection from 'components/SmartArticle/AddSection';
import ContentEditable from 'components/SmartArticle/ContentEditable';
import SectionStatementBrowser from 'components/SmartArticle/SectionStatementBrowser';
import SectionType from 'components/SmartArticle/SectionType';
import { DeleteButton, MarkdownPlaceholder, MoveHandle, SectionStyled } from 'components/SmartArticle/styled';
import { CLASSES } from 'constants/graphSettings';
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

    const SortableHandle = sortableHandle(() => (
        <MoveHandle className={isHovering ? 'hover' : ''}>
            <Icon icon={faBars} />
        </MoveHandle>
    ));

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

    const handleBlurTitle = async text2 => {
        dispatch(
            updateSectionTitle({
                sectionId: title.id,
                title: text2
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
            dispatch(deleteSection(title.id));
        }
    };

    const isStatementBrowserSection = props.section.type.id === CLASSES.RESOURCE_SECTION;
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

                {isStatementBrowserSection && <SectionStatementBrowser section={props.section} />}

                {!isStatementBrowserSection && !editMode && (
                    <Tippy hideOnClick={false} content="Double click to edit">
                        {markdownValue && markdownValue !== 'null' ? (
                            <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(markdownValue) }} onDoubleClick={() => setEditMode(true)} />
                        ) : (
                            <MarkdownPlaceholder onDoubleClick={() => setEditMode(true)}>Double click to edit this text</MarkdownPlaceholder>
                        )}
                    </Tippy>
                )}

                {!isStatementBrowserSection && editMode && (
                    <Textarea
                        value={markdownValue !== 'null' ? markdownValue : ''}
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
