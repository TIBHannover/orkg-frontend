import { Label, ListBox, Select } from '@heroui/react';
import { ChangeEvent, FC, FocusEvent, useState } from 'react';

import MarkdownEditor from '@/components/ArticleBuilder/MarkdownEditor/MarkdownEditor';
import { EditableTitle } from '@/components/ArticleBuilder/styled';
import useList from '@/components/List/hooks/useList';
import { LiteratureListSectionText } from '@/services/backend/types';

type EditSectionTextProps = {
    section: LiteratureListSectionText;
};

const EditSectionText: FC<EditSectionTextProps> = ({ section }) => {
    const [title, setTitle] = useState(section.heading);
    const { list, updateSection } = useList();

    if (!list) {
        return null;
    }

    const handleBlurTitle = (e: FocusEvent<HTMLInputElement>) => {
        if (e.target.value !== section.heading) {
            updateSection(section.id, {
                heading: e.target.value,
                heading_size: section.heading_size,
                text: section.text,
            });
        }
    };

    const handleUpdateMarkdown = (markdown: string) => {
        updateSection(section.id, {
            heading: section.heading,
            heading_size: section.heading_size,
            text: markdown,
        });
    };

    const handleUpdateHeadingLevel = (level: string) => {
        updateSection(section.id, {
            heading: section.heading,
            heading_size: parseInt(level, 10),
            text: section.text,
        });
    };

    return (
        <>
            <div className="flex items-center border-b pb-1 mb-4">
                <Select
                    aria-label="Select heading level"
                    className="mr-2 w-20 shrink-0"
                    value={String(section.heading_size)}
                    onChange={(key) => handleUpdateHeadingLevel(String(key))}
                >
                    <Label className="sr-only">Heading level</Label>
                    <Select.Trigger className="min-w-20">
                        <Select.Value />
                        <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                        <ListBox>
                            <ListBox.Item key="1" id="1" textValue="H1">
                                H1
                            </ListBox.Item>
                            <ListBox.Item key="2" id="2" textValue="H2">
                                H2
                            </ListBox.Item>
                            <ListBox.Item key="3" id="3" textValue="H3">
                                H3
                            </ListBox.Item>
                            <ListBox.Item key="4" id="4" textValue="H4">
                                H4
                            </ListBox.Item>
                            <ListBox.Item key="5" id="5" textValue="H5">
                                H5
                            </ListBox.Item>
                            <ListBox.Item key="6" id="6" textValue="H6">
                                H6
                            </ListBox.Item>
                        </ListBox>
                    </Select.Popover>
                </Select>
                <h2 id={`section-${section.id}`} className={`h${section.heading_size} grow m-0`}>
                    <EditableTitle
                        value={title}
                        className="focus-primary"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                        onBlur={handleBlurTitle}
                        placeholder="Enter a section title..."
                    />
                </h2>
            </div>
            <MarkdownEditor label={section.text} handleUpdate={handleUpdateMarkdown} />
        </>
    );
};

export default EditSectionText;
