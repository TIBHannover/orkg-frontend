import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { ChangeEvent, FC, FocusEvent, useEffect, useRef, useState } from 'react';

import MarkdownEditor from '@/components/ArticleBuilder/MarkdownEditor/MarkdownEditor';
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
import { createDraggableItem, createEdgeChangeHandler, type DragData } from '@/components/shared/dnd/dragAndDropUtils';
import SortableSection from '@/components/shared/dnd/SortableSection/SortableSection';
import { ReviewSection } from '@/services/backend/types';

export type HandleManualSort = ({ id, direction }: { id: string; direction: 'up' | 'down' }) => void;

type SectionProps = {
    section: ReviewSection;
    index: number;
    atIndex: number;
    instanceId: symbol;
    createDragData: (params: { item: ReviewSection; index: number; instanceId: symbol }) => DragData<ReviewSection>;
    isDragData: (data: Record<string | symbol, unknown>) => data is DragData<ReviewSection>;

    handleManualSort: HandleManualSort;
};

const Section: FC<SectionProps> = ({ section, index, atIndex, instanceId, createDragData, isDragData, handleManualSort }) => {
    const { deleteSection, updateSection, parsedReferences } = useReview();
    const [title, setTitle] = useState(section.heading);
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef<HTMLElement>(null);
    const [dragHandleElement, setDragHandleElement] = useState<HTMLElement | null>(null);

    const isContentLinkSection = ['resource', 'property', 'visualization', 'comparison', 'visualization'].includes(section.type);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return undefined;
        }

        const edgeChangeHandler = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            dragHandle: dragHandleElement,
            item: section,
            index,
            instanceId,
            createDragData,
            isDragData,
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
            allowedEdges: ['top', 'bottom'],
            onEdgeChange: edgeChangeHandler,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [section, index, instanceId, createDragData, isDragData, dragHandleElement]);

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
        <section ref={ref} style={{ opacity: isDragging ? 0.7 : 1, position: 'relative' }}>
            <SortableSection
                handleDelete={handleDelete}
                handleSort={(direction: 'up' | 'down') => handleManualSort({ id: section.id, direction })}
                dragHandleRef={setDragHandleElement}
            >
                <SectionType
                    type={isTypeSelectionDisabled ? section.type : section.classes?.[0]}
                    isDisabled={isTypeSelectionDisabled}
                    section={section}
                />
                <h2 id={`section-${section.id}`} className="h4 border-bottom pb-1 mb-3">
                    <EditableTitle
                        value={title}
                        className="focus-primary"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
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
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
        </section>
    );
};

export default Section;
