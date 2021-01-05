import { faBold, faCode, faImage, faItalic, faLink, faList, faListOl, faQuoteLeft, faUnderline } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippy.js/react';
import { updateSectionMarkdown } from 'actions/smartArticle';
import { MarkdownPlaceholder } from 'components/SmartArticle/styled';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import { Button, ButtonGroup } from 'reactstrap';
import * as Showdown from 'showdown';

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

const SectionMarkdown = props => {
    const [markdownValue, setMarkdownValue] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [selectionRange, setSelectionRange] = useState(null);
    const { markdown } = props;
    const dispatch = useDispatch();
    const markdownEditorRef = useRef(null);

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

    // select text in textarea when a markdown command is executed
    useEffect(() => {
        if (!selectionRange) {
            return;
        }
        const textArea = markdownEditorRef.current;
        const { start, end, length } = selectionRange;
        textArea.focus();
        textArea.setSelectionRange(start + length, end + length);
        setSelectionRange(null);
    }, [selectionRange]);

    const handleBlurMarkdown = () => {
        setEditMode(false);

        dispatch(
            updateSectionMarkdown({
                id: markdown.id,
                markdown: markdownValue
            })
        );
    };

    const wrapText = (e, openTag, closeTag = '') => {
        e.preventDefault(); // prevent blur on the textarea
        const textArea = markdownEditorRef.current;
        const len = textArea.value.length;
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        const selectedText = textArea.value.substring(start, end);
        const replacement = openTag + selectedText + closeTag;
        const value = textArea.value.substring(0, start) + replacement + textArea.value.substring(end, len);
        setMarkdownValue(value);
        setSelectionRange({ start, end, length: openTag.length });
    };

    return (
        <>
            {!editMode && (
                <Tippy hideOnClick={false} content="Double click to edit">
                    {markdownValue ? (
                        <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(markdownValue) }} onDoubleClick={() => setEditMode(true)} />
                    ) : (
                        <MarkdownPlaceholder onDoubleClick={() => setEditMode(true)}>Double click to edit this text</MarkdownPlaceholder>
                    )}
                </Tippy>
            )}

            {editMode && (
                <>
                    <div style={{ position: 'absolute', top: 25 }}>
                        <ButtonGroup className="mr-1" size="sm">
                            <Button color="dark" onMouseDown={e => wrapText(e, '**', '**')}>
                                <Icon icon={faBold} />
                            </Button>
                            <Button color="dark" onMouseDown={e => wrapText(e, '*', '*')}>
                                <Icon icon={faItalic} />
                            </Button>
                            <Button color="dark" onMouseDown={e => wrapText(e, '__', '__')}>
                                <Icon icon={faUnderline} />
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup className="mr-1" size="sm">
                            <Button color="dark" onMouseDown={e => wrapText(e, '* ')}>
                                <Icon icon={faList} />
                            </Button>
                            <Button color="dark" onMouseDown={e => wrapText(e, '1. ')}>
                                <Icon icon={faListOl} />
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup size="sm">
                            <Button color="dark" onMouseDown={e => wrapText(e, '[', '](url)')}>
                                <Icon icon={faLink} />
                            </Button>
                            <Button color="dark" onMouseDown={e => wrapText(e, '![', '](https://example.com/img.png)')}>
                                <Icon icon={faImage} />
                            </Button>
                            <Button color="dark" onMouseDown={e => wrapText(e, '> ')}>
                                <Icon icon={faQuoteLeft} />
                            </Button>
                            <Button color="dark" onMouseDown={e => wrapText(e, '`', '`')}>
                                <Icon icon={faCode} />
                            </Button>
                        </ButtonGroup>
                    </div>
                    <Textarea
                        value={markdownValue}
                        onChange={e => setMarkdownValue(e.target.value)}
                        onBlur={handleBlurMarkdown}
                        className="form-control"
                        inputRef={markdownEditorRef}
                    />
                </>
            )}
        </>
    );
};

SectionMarkdown.propTypes = {
    markdown: PropTypes.object.isRequired
};

export default SectionMarkdown;
