import '@webscopeio/react-textarea-autocomplete/style.css';

import {
    faBold,
    faCode,
    faExternalLinkAlt,
    faImage,
    faItalic,
    faLink,
    faList,
    faListOl,
    faQuoteLeft,
    faStrikethrough,
    faTable,
    faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, toast, Tooltip } from '@heroui/react';
// @ts-expect-error library has no type definitions
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import { env } from 'next-runtime-env';
import { FC, KeyboardEvent, MouseEvent, ReactNode, useEffect, useState } from 'react';
import Textarea from 'react-textarea-autosize';

import MarkdownRenderer from '@/components/ArticleBuilder/MarkdownEditor/MarkdownRenderer';
import TextSection from '@/components/Review/Sections/Text/TextSection';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResource, getResources } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedReferenceEntry = { parsedReference: any; referenceIndex: number; rawReference: string };

type AutocompleteResource = { resource: Resource };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AutocompleteReference = { reference: any; char: string };

type MarkdownEditorProps = {
    label: string;
    handleUpdate: (value: string) => void;
    references?: ParsedReferenceEntry[] | null;
    sectionId?: string | null;
};

const ItemReference: FC<{ entity: AutocompleteReference }> = ({ entity: { reference } }) => (
    <div onMouseDown={(e) => e.preventDefault()} className="px-2 py-1">
        {reference.id}{' '}
        <span className="ml-2 italic opacity-70">
            {reference?.author?.[0]?.family ?? ''} {reference?.author?.length > 0 ? 'et al.' : ''} {reference?.issued?.['date-parts']?.[0] ?? ''}
        </span>
    </div>
);

const ItemResource: FC<{ entity: AutocompleteResource }> = ({ entity: { resource } }) => (
    <div onMouseDown={(e) => e.preventDefault()} className="px-2 py-1">
        {resource.label}
        <span className="ml-2 italic opacity-70">{resource.id}</span>
    </div>
);

const Loading: FC = () => <div>Loading</div>;

type ToolbarButtonProps = {
    label: string;
    icon: typeof faBold;
    onWrap: (e: MouseEvent<HTMLButtonElement>) => void;
};

const ToolbarButton: FC<ToolbarButtonProps> = ({ label, icon, onWrap }) => (
    <Tooltip>
        <Tooltip.Trigger className="inline-flex">
            <Button isIconOnly size="sm" variant="secondary" aria-label={label} onMouseDown={onWrap}>
                <FontAwesomeIcon icon={icon} />
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>{label}</Tooltip.Content>
    </Tooltip>
);

const ToolbarGroup: FC<{ children: ReactNode }> = ({ children }) => <div className="toolbar-group">{children}</div>;

const MarkdownEditor: FC<MarkdownEditorProps> = ({ label, handleUpdate, references = null, sectionId = null }) => {
    const [markdownValue, setMarkdownValue] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [markdownEditorRef, setMarkdownEditorRef] = useState<HTMLTextAreaElement | null>(null);
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number; length: number } | null>(null);

    useEffect(() => {
        if (typeof label === 'undefined') {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMarkdownValue(label);
    }, [label]);

    useEffect(() => {
        if (editMode && markdownEditorRef) {
            markdownEditorRef.focus();
        }
    }, [editMode, markdownEditorRef]);

    useEffect(() => {
        if (!selectionRange || !markdownEditorRef) {
            return;
        }
        const { start, end, length } = selectionRange;
        markdownEditorRef.focus();
        markdownEditorRef.setSelectionRange(start + length, end + length);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectionRange(null);
    }, [markdownEditorRef, selectionRange]);

    const handleBlurMarkdown = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        if ((e.target as HTMLElement).className?.includes?.('list-item')) {
            return;
        }
        setEditMode(false);
        handleUpdate(markdownValue);
    };

    const wrapText = (e: MouseEvent<HTMLButtonElement>, openTag: string, closeTag = '') => {
        e.preventDefault();

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

    const findResources = async (token: string): Promise<AutocompleteResource[]> => {
        if (token.startsWith('!#')) {
            const resourceId = token.substring(2);
            if (!resourceId) {
                return [];
            }
            try {
                const resource = await getResource(resourceId);
                return [{ resource }];
            } catch (e) {
                console.error(e);
                return [];
            }
        }
        return token && token !== '!'
            ? (await getResources({ q: token.substring(1), returnContent: true, size: 10 })).map((resource) => ({ resource }))
            : [];
    };

    const autocompleteTriggers = {
        '[!': {
            dataProvider: findResources,
            component: ItemResource,
            allowWhitespace: true,
            output: (item: AutocompleteResource) =>
                `[${item.resource.label}](${env('NEXT_PUBLIC_URL')}${reverse(ROUTES.RESOURCE, {
                    id: item.resource.id,
                })})`,
        },
        '[@': {
            dataProvider: (token: string) =>
                (references ?? [])
                    .filter((reference) => reference.parsedReference.id.toLowerCase().startsWith(token.toLowerCase().substring(1)))
                    .map((reference) => ({ reference: reference.parsedReference, char: reference.parsedReference.id })),
            component: ItemReference,
            output: (item: AutocompleteReference) => `[@${item.char}]`,
        },
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            setEditMode(true);
        }
    };

    return (
        <>
            {!editMode && (
                <Tooltip>
                    <Tooltip.Trigger className="inline-flex w-full">
                        {markdownValue ? (
                            <div role="button" tabIndex={0} className="w-full" onKeyPress={handleKeyPress} onDoubleClick={() => setEditMode(true)}>
                                {references && sectionId ? (
                                    <TextSection text={markdownValue} sectionId={sectionId} />
                                ) : (
                                    <MarkdownRenderer text={markdownValue} />
                                )}
                            </div>
                        ) : (
                            <span
                                role="button"
                                tabIndex={0}
                                className="text-muted"
                                onKeyPress={handleKeyPress}
                                onDoubleClick={() => setEditMode(true)}
                            >
                                Double click to edit this text
                            </span>
                        )}
                    </Tooltip.Trigger>
                    <Tooltip.Content>Double click to edit</Tooltip.Content>
                </Tooltip>
            )}
            {editMode && (
                <div className="markdown-editor-rta">
                    <div className="sticky top-[85px] z-[100] -mt-10 mb-[3px] flex flex-wrap gap-2">
                        <ToolbarGroup>
                            <ToolbarButton label="Add bold text" icon={faBold} onWrap={(e) => wrapText(e, '**', '**')} />
                            <ToolbarButton label="Add italic text" icon={faItalic} onWrap={(e) => wrapText(e, '*', '*')} />
                            <ToolbarButton label="Add strikethrough text" icon={faStrikethrough} onWrap={(e) => wrapText(e, '~~', '~~')} />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <ToolbarButton label="Add bullet list" icon={faList} onWrap={(e) => wrapText(e, '* ')} />
                            <ToolbarButton label="Add numbered list" icon={faListOl} onWrap={(e) => wrapText(e, '1. ')} />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            <ToolbarButton label="Add link" icon={faLink} onWrap={(e) => wrapText(e, '[', '](url)')} />
                            <ToolbarButton label="Add image" icon={faImage} onWrap={(e) => wrapText(e, '![', '](https://example.com/img.png)')} />
                            <ToolbarButton
                                label="Add video"
                                icon={faVideo}
                                onWrap={(e) => wrapText(e, '![', '](https://av.tib.eu/media/16120 =500x300)')}
                            />
                        </ToolbarGroup>
                        <ToolbarGroup>
                            {references && (
                                <>
                                    <ToolbarButton label="Add citation" icon={faQuoteLeft} onWrap={(e) => wrapText(e, '[@', ']')} />
                                    <ToolbarButton label="Add ORKG resource" icon={faExternalLinkAlt} onWrap={(e) => wrapText(e, '[!', ']')} />
                                </>
                            )}
                            <ToolbarButton
                                label="Add table"
                                icon={faTable}
                                onWrap={(e) => wrapText(e, '| Header 1 | Header 2 |\n| ------ | ------ |\n| Item   | Item   |\n| Item   | Item   |')}
                            />
                            <ToolbarButton label="Add code" icon={faCode} onWrap={(e) => wrapText(e, '`', '`')} />
                        </ToolbarGroup>
                    </div>
                    <ReactTextareaAutocomplete
                        value={markdownValue}
                        textAreaComponent={Textarea}
                        className="w-full rounded-md border border-default bg-field-background px-3 py-2 text-sm text-field-foreground placeholder:text-field-placeholder focus:outline-2 focus:outline-focus"
                        loadingComponent={Loading}
                        innerRef={(ref: HTMLTextAreaElement) => {
                            setMarkdownEditorRef(ref);
                        }}
                        dropdownStyle={{ zIndex: 100 }}
                        minChar={0}
                        trigger={references ? autocompleteTriggers : {}}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setMarkdownValue(e.target.value);
                            if (e.target.value.length > 3899) {
                                toast.warning('The section text cannot exceed 3900 characters');
                            }
                        }}
                        onBlur={handleBlurMarkdown}
                        maxLength={3900}
                    />
                </div>
            )}
        </>
    );
};

export default MarkdownEditor;
