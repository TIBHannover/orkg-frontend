import EditSection from 'components/List/EditSection';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableContainer } from 'react-sortable-hoc';
import { Container } from 'reactstrap';
import { moveSection } from 'slices/listSlice';
import { createGlobalStyle } from 'styled-components';

const SortableList = SortableContainer(({ items, handleManualSort }) => (
    <Container className="position-relative p-0">
        {items.map((section, index) => (
            <EditSection
                collection="sections"
                key={section.id}
                index={index}
                section={section}
                atIndex={index + 1}
                handleManualSort={handleManualSort}
            />
        ))}
    </Container>
));

const GlobalStyle = createGlobalStyle`
    .is-dragging {
        opacity: 0.7;
    }
`;

const SortableSectionsList = () => {
    const sections = useSelector(state => state.list.sections);
    const list = useSelector(state => state.list.list);
    const [isSorting, setIsSorting] = useState(false);
    const dispatch = useDispatch();

    const handleSortEnd = ({ oldIndex, newIndex }) => {
        setIsSorting(false);
        if (oldIndex !== newIndex) {
            dispatch(moveSection({ listId: list.id, sections, oldIndex, newIndex }));
        }
    };

    const handleManualSort = ({ id, direction }) => {
        const oldIndex = sections.findIndex(section => section.id === id);
        const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
        if (newIndex < 0) {
            return;
        }
        dispatch(moveSection({ listId: list.id, sections, oldIndex, newIndex }));
    };

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

export default SortableSectionsList;
