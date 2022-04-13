import { moveSection } from 'slices/reviewSlice';
import Outline from 'components/Review/Outline';
import Section from 'components/Review/Section';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableContainer } from 'react-sortable-hoc';
import { Container } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';

const SortableList = SortableContainer(({ items, handleManualSort }) => (
    <Container style={{ position: 'relative' }}>
        <Outline editMode />
        {items.map((section, index) => (
            <Section key={section.title.id} index={index} section={section} atIndex={index + 1} handleManualSort={handleManualSort} />
        ))}
    </Container>
));

const GlobalStyle = createGlobalStyle`
    .is-dragging {
        opacity: 0.7;
    }
`;

const Sections = () => {
    const sections = useSelector(state => state.review.sections);
    const contributionId = useSelector(state => state.review.contributionId);
    const [isSorting, setIsSorting] = useState(false);
    const dispatch = useDispatch();

    const handleSortEnd = ({ oldIndex, newIndex }) => {
        setIsSorting(false);
        if (oldIndex !== newIndex) {
            dispatch(moveSection({ contributionId, sections, oldIndex, newIndex }));
        }
    };

    const handleManualSort = ({ id, direction }) => {
        const oldIndex = sections.findIndex(section => section.id === id);
        const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
        if (newIndex < 0) {
            return;
        }
        dispatch(moveSection({ contributionId, sections, oldIndex, newIndex }));
    };

    // disable pointer events for all elements while sorting (prevents trigger hover in the sections)
    return (
        <div style={{ pointerEvents: isSorting ? 'none' : 'all' }}>
            <GlobalStyle />

            <SortableList
                items={sections}
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

export default Sections;
