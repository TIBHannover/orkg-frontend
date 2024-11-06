import MarkdownEditor from 'components/ArticleBuilder/MarkdownEditor/MarkdownEditor';
import { EditableTitle } from 'components/ArticleBuilder/styled';
import useList from 'components/List/hooks/useList';
import { FC, FocusEvent, useState } from 'react';
import { Input } from 'reactstrap';
import { LiteratureListSectionText } from 'services/backend/types';

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
            <div className="d-flex align-items-center  border-bottom pb-1 mb-3">
                <Input
                    aria-label="Select heading level"
                    className="me-2"
                    type="select"
                    style={{ width: 70 }}
                    value={section.heading_size}
                    onChange={(e) => handleUpdateHeadingLevel(e.target.value)}
                >
                    <option value="1">H1</option>
                    <option value="2">H2</option>
                    <option value="3">H3</option>
                    <option value="4">H4</option>
                    <option value="5">H5</option>
                    <option value="6">H6</option>
                </Input>
                <h2 id={`section-${section.id}`} className={`h${section.heading_size} flex-grow-1 m-0`} placeholder="trd">
                    <EditableTitle
                        value={title}
                        className="focus-primary"
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleBlurTitle}
                        placeholder="Enter a section title..."
                        resize="false"
                    />
                </h2>
            </div>

            <MarkdownEditor label={section.text} handleUpdate={handleUpdateMarkdown} />
        </>
    );
};

export default EditSectionText;
