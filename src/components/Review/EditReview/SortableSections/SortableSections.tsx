import { useCallback, useEffect, useState } from 'react';
import { Container } from 'reactstrap';

import Section, { HandleManualSort } from '@/components/Review/EditReview/SortableSections/Section/Section';
import useReview from '@/components/Review/hooks/useReview';
import Outline from '@/components/Review/Outline/Outline';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createInstanceId,
    createListMonitor,
    performReorder,
    type ReorderParams,
} from '@/components/shared/dnd/dragAndDropUtils';
import { ReviewSection } from '@/services/backend/types';

// Create shared symbols and functions for review sections
const reviewSectionKey = createDragDataKey('reviewSection');
const createReviewSectionData = createDragDataFactory<ReviewSection>(reviewSectionKey);
const isReviewSectionData = createDragDataValidator<ReviewSection>(reviewSectionKey);

const SortableSections = () => {
    const { review, updateReview } = useReview();
    const [instanceId] = useState(() => createInstanceId('review-sections'));

    const reorderSections = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            if (!review) return;

            const reorderedSections = performReorder({
                items: review.sections,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (reorderedSections !== review.sections) {
                updateReview({
                    sections: reorderedSections,
                });
            }
        },
        [review, updateReview],
    );

    const sortSections = useCallback(
        (oldIndex: number, newIndex: number) => {
            if (!review || newIndex < 0 || oldIndex === newIndex || newIndex >= review.sections.length) {
                return;
            }

            reorderSections({
                startIndex: oldIndex,
                indexOfTarget: newIndex,
                closestEdgeOfTarget: null,
            });
        },
        [review, reorderSections],
    );

    const handleManualSort: HandleManualSort = useCallback(
        ({ id, direction }) => {
            if (!review) return;

            const oldIndex = review.sections.findIndex((section) => section.id === id);
            const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
            if (newIndex < 0 || newIndex >= review.sections.length) {
                return;
            }
            sortSections(oldIndex, newIndex);
        },
        [review, sortSections],
    );

    useEffect(() => {
        if (!review) return undefined;

        return createListMonitor({
            instanceId,
            items: review.sections,
            isDragData: isReviewSectionData,
            onReorder: reorderSections,
            getItemId: (section) => section.id,
        });
    }, [instanceId, review, reorderSections]);

    if (!review) {
        return null;
    }

    return (
        <Container style={{ position: 'relative' }}>
            <Outline editMode />
            {review.sections.map((section, index) => (
                <Section
                    key={section.id}
                    index={index}
                    section={section}
                    atIndex={index + 1}
                    instanceId={instanceId}
                    createDragData={createReviewSectionData}
                    isDragData={isReviewSectionData}
                    handleManualSort={handleManualSort}
                />
            ))}
        </Container>
    );
};

export default SortableSections;
