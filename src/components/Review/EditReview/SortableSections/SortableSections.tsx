import { reorderList, useAutoScroll, useSortableList } from '@orkg/pragmatic-dnd-hooks';
import { useCallback } from 'react';

import Section, { HandleManualSort } from '@/components/Review/EditReview/SortableSections/Section/Section';
import useReview from '@/components/Review/hooks/useReview';
import Outline from '@/components/Review/Outline/Outline';
import Container from '@/components/Ui/Structure/Container';

const SortableSections = () => {
    const { review, updateReview } = useReview();

    const { instanceId, moveItem } = useSortableList({
        itemCount: review?.sections.length ?? 0,
        onReorder: (event) => {
            if (!review) return;
            updateReview({
                sections: reorderList(review.sections, event),
            });
        },
    });

    useAutoScroll({ instanceId, includeWindow: true });

    const handleManualSort: HandleManualSort = useCallback(
        ({ id, direction }) => {
            if (!review) return;

            const oldIndex = review.sections.findIndex((section) => section.id === id);
            if (oldIndex === -1) {
                return;
            }
            moveItem(oldIndex, direction === 'up' ? oldIndex - 1 : oldIndex + 1);
        },
        [review, moveItem],
    );

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
                    moveItem={moveItem}
                    handleManualSort={handleManualSort}
                />
            ))}
        </Container>
    );
};

export default SortableSections;
