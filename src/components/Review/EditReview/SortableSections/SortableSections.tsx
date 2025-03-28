import arrayMove from 'array-move';
import { useState } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { Container } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';

import Section, { HandleManualSort } from '@/components/Review/EditReview/SortableSections/Section/Section';
import useReview from '@/components/Review/hooks/useReview';
import Outline from '@/components/Review/Outline/Outline';
import { ReviewSection } from '@/services/backend/types';

type SortableListProps = {
    items: ReviewSection[];
    handleManualSort: HandleManualSort;
};

const SortableList = SortableContainer<SortableListProps>(({ items, handleManualSort }: SortableListProps) => (
    <Container style={{ position: 'relative' }}>
        <Outline editMode />
        {items.map((section, index) => (
            <Section key={section.id} index={index} section={section} atIndex={index + 1} handleManualSort={handleManualSort} />
        ))}
    </Container>
));

const GlobalStyle = createGlobalStyle`
    .is-dragging {
        opacity: 0.7;
    }
`;

const SortableSections = () => {
    const { review, updateReview } = useReview();
    const [isSorting, setIsSorting] = useState(false);

    if (!review) {
        return null;
    }

    const sortSections = (oldIndex: number, newIndex: number) => {
        if (newIndex < 0 || oldIndex === newIndex) {
            return;
        }
        const sectionsNewOrder = arrayMove(review.sections, oldIndex, newIndex);
        updateReview({
            sections: sectionsNewOrder,
        });
    };

    const handleSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        setIsSorting(false);
        if (oldIndex !== newIndex) {
            sortSections(oldIndex, newIndex);
        }
    };

    const handleManualSort: HandleManualSort = ({ id, direction }) => {
        const oldIndex = review.sections.findIndex((section) => section.id === id);
        const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
        if (newIndex < 0) {
            return;
        }
        sortSections(oldIndex, newIndex);
    };

    // disable pointer events for all elements while sorting (prevents trigger hover in the sections)
    return (
        <div style={{ pointerEvents: isSorting ? 'none' : 'all' }}>
            <GlobalStyle />

            <SortableList
                items={review.sections}
                onSortEnd={handleSortEnd}
                updateBeforeSortStart={() => setIsSorting(true)}
                lockAxis="y"
                useDragHandle
                helperClass="is-dragging"
                useWindowAsScrollContainer
                handleManualSort={handleManualSort}
            />
        </div>
    );
};

export default SortableSections;
