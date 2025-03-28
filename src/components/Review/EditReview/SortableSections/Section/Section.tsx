import { FC, FocusEvent, useState } from 'react';
import { SortableElement } from 'react-sortable-hoc';

import MarkdownEditor from '@/components/ArticleBuilder/MarkdownEditor/MarkdownEditor';
import SortableSection from '@/components/ArticleBuilder/SortableSection/SortableSection';
import { EditableTitle } from '@/components/ArticleBuilder/styled';
import Confirm from '@/components/Confirmation/Confirmation';
import AddSection from '@/components/Review/EditReview/AddSection/AddSection';
import SectionType from '@/components/Review/EditReview/SortableSections/Section/SectionType/SectionType';
import useReview from '@/components/Review/hooks/useReview';
import EditSectionComparison from '@/components/Review/Sections/Comparison/EditSectionComparison/EditSectionComparison';
import { SectionContentLinkTypes } from '@/components/Review/Sections/ContentLink/ContentLink';
import SectionOntology from '@/components/Review/Sections/Ontology/SectionOntology';
import EditSectionResourceProperty from '@/components/Review/Sections/ResourceProperty/EditSectionResourceProperty/EditSectionResourceProperty';
import EditSectionVisualization from '@/components/Review/Sections/Visualization/EditSectionVisualization/EditSectionVisualization';
import { ReviewSection } from '@/services/backend/types';

export type HandleManualSort = ({ id, direction }: { id: string; direction: 'up' | 'down' }) => void;

type SectionProps = {
    section: ReviewSection;
    atIndex: number;
    handleManualSort: HandleManualSort;
};

const Section: FC<SectionProps> = ({ section, atIndex, handleManualSort }) => {
    const { deleteSection, updateSection, parsedReferences } = useReview();
    const [title, setTitle] = useState(section.heading);
    const isContentLinkSection = ['resource', 'property', 'visualization', 'comparison', 'visualization'].includes(section.type);

    const handleBlurTitle = (e: FocusEvent<HTMLInputElement>) => {
        if (e.target.value !== section.heading) {
            const sectionType: SectionContentLinkTypes =
                section.type !== 'property' ? (section.type as SectionContentLinkTypes) : ('predicate' as SectionContentLinkTypes);

            updateSection(section.id, {
                heading: e.target.value,
                ...(section.type === 'ontology' && {
                    entities: section.entities?.map(({ id }) => id),
                    predicates: section.predicates?.map(({ id }) => id),
                }),
                ...(section.type === 'text' && { text: section.text, class: section.classes?.[0] }),
                ...(isContentLinkSection && {
                    [sectionType]: section[sectionType]?.id ?? null,
                }),
            });
        }
    };
    const handleUpdateMarkdown = (markdown: string) => {
        updateSection(section.id, {
            heading: section.heading,
            text: markdown,
            class: section.classes?.[0],
        });
    };

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this section?',
        });

        if (confirm) {
            deleteSection(section.id);
        }
    };

    const isTypeSelectionDisabled = isContentLinkSection || section.type === 'ontology';

    return (
        <section>
            <SortableSection handleDelete={handleDelete} handleSort={(direction) => handleManualSort({ id: section.id, direction })}>
                <SectionType
                    type={isTypeSelectionDisabled ? section.type : section.classes?.[0]}
                    isDisabled={isTypeSelectionDisabled}
                    section={section}
                />
                <h2 id={`section-${section.id}`} className="h4 border-bottom pb-1 mb-3" placeholder="trd">
                    <EditableTitle
                        value={title}
                        className="focus-primary"
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleBlurTitle}
                        placeholder="Enter a section title..."
                        resize="false"
                    />
                </h2>

                {(section.type === 'property' || section.type === 'resource') && <EditSectionResourceProperty section={section} />}

                {section.type === 'visualization' && <EditSectionVisualization section={section} />}

                {section.type === 'ontology' && <SectionOntology section={section} />}

                {section.type === 'comparison' && <EditSectionComparison section={section} index={atIndex} />}

                {section.type === 'text' && typeof section.text !== 'undefined' && (
                    /* @ts-expect-error awaiting migration */
                    <MarkdownEditor label={section.text} handleUpdate={handleUpdateMarkdown} sectionId={section.id} references={parsedReferences} />
                )}
            </SortableSection>
            <AddSection index={atIndex} />
        </section>
    );
};

export default SortableElement<SectionProps>(Section);
