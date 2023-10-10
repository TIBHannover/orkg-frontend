import {
    faBold,
    faCode,
    faImage,
    faItalic,
    faLink,
    faList,
    faListOl,
    faQuoteLeft,
    faTable,
    faUnderline,
    faVideo,
    faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import '@webscopeio/react-textarea-autocomplete/style.css';
import MarkdownRenderer from 'components/ArticleBuilder/MarkdownEditor/MarkdownRenderer';
import MarkdownRendererReferences from 'components/Review/MarkdownRenderer';
import { MarkdownPlaceholder } from 'components/ArticleBuilder/styled';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import { ButtonGroup } from 'reactstrap';
import env from 'components/NextJsMigration/env';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import { getResource, getResources } from 'services/backend/resources';
import styled from 'styled-components';

const Toolbar = styled.div`
    position: sticky;
    top: 85px;
    margin-bottom: 3px;
    margin-top: -40px;
    z-index: 100;
`;

const MarkdownSection = styled.div`
    .rta__list {
        border-radius: 6px;
        overflow: hidden;
        font-size: 90%;
    }
    .rta__entity--selected {
        background: ${props => props.theme.primary};
    }
`;

const ItemReference = ({ entity: { reference } }) => (
    <div role="button" onMouseDown={e => e.preventDefault()} className="px-2 py-1">
        {reference.id}{' '}
        <span className="font-italic ms-2" style={{ opacity: 0.7 }}>
            {reference?.author?.[0]?.family ?? ''} {reference?.author?.length > 0 ? 'et al.' : ''} {reference?.issued?.['date-parts']?.[0] ?? ''}
        </span>
    </div>
);

ItemReference.propTypes = {
    entity: PropTypes.object.isRequired,
};

const ItemResource = ({ entity: { resource } }) => (
    <div role="button" onMouseDown={e => e.preventDefault()} className="px-2 py-1">
        {resource.label}
        <span className="font-italic ms-2" style={{ opacity: 0.7 }}>
            {resource.id}
        </span>
    </div>
);

ItemResource.propTypes = {
    entity: PropTypes.object.isRequired,
};

const Loading = () => <div>Loading</div>;

const MarkdownEditor = ({ label, handleUpdate, references = null, literalId = null }) => {
    const [markdownValue, setMarkdownValue] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [markdownEditorRef, setMarkdownEditorRef] = useState(null);
    const [selectionRange, setSelectionRange] = useState(null);

    // initial data loading
    useEffect(() => {
        if (!label) {
            return;
        }
        setMarkdownValue(label);
    }, [label]);

    // set focus to editor when starting edit mode
    useEffect(() => {
        if (editMode && markdownEditorRef) {
            markdownEditorRef.focus();
        }
    }, [editMode, markdownEditorRef]);

    // select text in textarea when a markdown command is executed
    useEffect(() => {
        if (!selectionRange) {
            return;
        }
        const { start, end, length } = selectionRange;
        markdownEditorRef.focus();
        markdownEditorRef.setSelectionRange(start + length, end + length);
        setSelectionRange(null);
    }, [markdownEditorRef, selectionRange]);

    const handleBlurMarkdown = e => {
        if (e.target.className.includes('list-item')) {
            return;
        }
        setEditMode(false);

        handleUpdate(markdownValue);
    };

    const wrapText = (e, openTag, closeTag = '') => {
        e.preventDefault(); // prevent blur on the textarea

        if (!markdownEditorRef) {
            return;
        }
        const len = markdownEditorRef.value.length;
        const start = markdownEditorRef.selectionStart;
        const end = markdownEditorRef.selectionEnd;
        const selectedText = markdownEditorRef.value.substring(start, end);
        const replacement = openTag + selectedText + closeTag;
        const value = markdownEditorRef.value.substring(0, start) + replacement + markdownEditorRef.value.substring(end, len);
        setMarkdownValue(value);
        setSelectionRange({ start, end, length: openTag.length });
    };

    const findResources = async token => {
        if (token.startsWith('!#')) {
            const resourceId = token.substring(2);
            if (!resourceId) {
                return [];
            }
            try {
                const resource = await getResource(resourceId);
                return [
                    {
                        resource,
                    },
                ];
            } catch (e) {
                return [];
            }
        } else {
            return token && token !== '!'
                ? (await getResources({ q: token.substring(1), returnContent: true, items: 10 })).map(resource => ({
                      resource,
                  }))
                : [];
        }
    };

    const autocompleteTriggers = {
        '[!': {
            dataProvider: findResources,
            component: ItemResource,
            allowWhitespace: true,
            output: item =>
                `[${item.resource.label}](${env('URL')}${reverse(ROUTES.RESOURCE, {
                    id: item.resource.id,
                })})`,
        },
        '[@': {
            dataProvider: token =>
                references
                    .filter(reference => reference.parsedReference.id.toLowerCase().startsWith(token.toLowerCase().substring(1)))
                    .map(reference => ({ reference: reference.parsedReference, char: reference.parsedReference.id })),
            component: ItemReference,
            output: item => `[@${item.char}]`,
        },
    };

    const handleKeyPress = e => {
        if (e.key === 'Enter') {
            setEditMode(true);
        }
    };

    return (
        <>
            {!editMode && (
                <Tippy hideOnClick={false} content="Double click to edit">
                    {markdownValue ? (
                        <div role="button" tabIndex="0" onKeyPress={handleKeyPress} onDoubleClick={() => setEditMode(true)}>
                            {references ? (
                                <MarkdownRendererReferences text={markdownValue} id={literalId} />
                            ) : (
                                <MarkdownRenderer text={markdownValue} />
                            )}
                        </div>
                    ) : (
                        <MarkdownPlaceholder role="button" tabIndex="0" onKeyPress={handleKeyPress} onDoubleClick={() => setEditMode(true)}>
                            Double click to edit this text
                        </MarkdownPlaceholder>
                    )}
                </Tippy>
            )}

            {editMode && (
                <MarkdownSection>
                    <Toolbar>
                        <ButtonGroup className="me-1" size="sm">
                            <Tippy content="Add bold text">
                                <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '**', '**')}>
                                    <Icon icon={faBold} />
                                </div>
                            </Tippy>
                            <Tippy content="Add italic text">
                                <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '*', '*')}>
                                    <Icon icon={faItalic} />
                                </div>
                            </Tippy>
                            <Tippy content="Add underlined text">
                                <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '__', '__')}>
                                    <Icon icon={faUnderline} />
                                </div>
                            </Tippy>
                        </ButtonGroup>
                        <ButtonGroup className="me-1" size="sm">
                            <Tippy content="Add bullet list">
                                <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '* ')}>
                                    <Icon icon={faList} />
                                </div>
                            </Tippy>
                            <Tippy content="Add numbered list">
                                <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '1. ')}>
                                    <Icon icon={faListOl} />
                                </div>
                            </Tippy>
                        </ButtonGroup>
                        <ButtonGroup className="me-1" size="sm">
                            <Tippy content="Add link">
                                <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '[', '](url)')}>
                                    <Icon icon={faLink} />
                                </div>
                            </Tippy>
                            <Tippy content="Add image">
                                <div
                                    role="button"
                                    tabIndex="0"
                                    className="btn btn-dark"
                                    onMouseDown={e => wrapText(e, '![', '](https://example.com/img.png)')}
                                >
                                    <Icon icon={faImage} />
                                </div>
                            </Tippy>
                            <Tippy content="Add video">
                                <div
                                    role="button"
                                    tabIndex="0"
                                    className="btn btn-dark"
                                    onMouseDown={e => wrapText(e, '![', '](https://av.tib.eu/media/16120 =500x300)')}
                                >
                                    <Icon icon={faVideo} />
                                </div>
                            </Tippy>
                        </ButtonGroup>
                        <ButtonGroup size="sm">
                            {references && (
                                <>
                                    <Tippy content="Add citation">
                                        <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '[@', ']')}>
                                            <Icon icon={faQuoteLeft} />
                                        </div>
                                    </Tippy>

                                    <Tippy content="Add ORKG resource">
                                        <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '[!', ']')}>
                                            <Icon icon={faExternalLinkAlt} />
                                        </div>
                                    </Tippy>
                                </>
                            )}
                            <Tippy content="Add table">
                                <div
                                    role="button"
                                    tabIndex="0"
                                    className="btn btn-dark"
                                    onMouseDown={e =>
                                        wrapText(e, '| Header 1 | Header 2 |\n| ------ | ------ |\n| Item   | Item   |\n| Item   | Item   |')
                                    }
                                >
                                    <Icon icon={faTable} />
                                </div>
                            </Tippy>
                            <Tippy content="Add code">
                                <div role="button" tabIndex="0" className="btn btn-dark" onMouseDown={e => wrapText(e, '`', '`')}>
                                    <Icon icon={faCode} />
                                </div>
                            </Tippy>
                        </ButtonGroup>
                    </Toolbar>
                    <ReactTextareaAutocomplete
                        value={markdownValue}
                        textAreaComponent={Textarea}
                        className="form-control"
                        loadingComponent={Loading}
                        innerRef={ref => {
                            setMarkdownEditorRef(ref);
                        }}
                        dropdownStyle={{ zIndex: 100 }}
                        minChar={0}
                        trigger={references ? autocompleteTriggers : {}}
                        onChange={e => {
                            setMarkdownValue(e.target.value);
                            if (e.target.value.length > 3899) {
                                toast.warning('The section text cannot exceed 3900 characters');
                            }
                        }}
                        onBlur={handleBlurMarkdown}
                        maxLength="3900"
                    />
                </MarkdownSection>
            )}
        </>
    );
};

MarkdownEditor.propTypes = {
    label: PropTypes.string.isRequired,
    handleUpdate: PropTypes.func.isRequired,
    references: PropTypes.array,
    literalId: PropTypes.string,
};

export default MarkdownEditor;
