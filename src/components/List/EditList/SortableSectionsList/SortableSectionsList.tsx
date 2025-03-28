import arrayMove from 'array-move';
import { useState } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import { Container } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';

import EditSection from '@/components/List/EditList/SortableSectionsList/EditSection/EditSection';
import useList from '@/components/List/hooks/useList';
import { LiteratureListSection } from '@/services/backend/types';

export type HandleManualSort = (params: { id: string; direction: 'up' | 'down' }) => void;

const SortableList = SortableContainer<{ items: LiteratureListSection[]; handleManualSort: HandleManualSort }>(
    ({ items, handleManualSort }: { items: LiteratureListSection[]; handleManualSort: HandleManualSort }) => (
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
    ),
);

const GlobalStyle = createGlobalStyle`
    .is-dragging {
        opacity: 0.7;
    }
`;

const SortableSectionsList = () => {
    const { list, updateList } = useList();
    const [isSorting, setIsSorting] = useState(false);

    if (!list) {
        return null;
    }

    const sortSections = (oldIndex: number, newIndex: number) => {
        if (newIndex < 0 || oldIndex === newIndex) {
            return;
        }
        const sectionsNewOrder = arrayMove(list.sections, oldIndex, newIndex);
        updateList({
            sections: sectionsNewOrder,
        });
    };

    const handleSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        setIsSorting(false);
        sortSections(oldIndex, newIndex);
    };

    const handleManualSort: HandleManualSort = ({ id, direction }) => {
        const oldIndex = list.sections.findIndex((section) => section.id === id);
        const newIndex = direction === 'up' ? oldIndex - 1 : oldIndex + 1;
        sortSections(oldIndex, newIndex);
    };

    return (
        <div style={{ pointerEvents: isSorting ? 'none' : 'all' }}>
            <GlobalStyle />

            <SortableList
                items={list.sections}
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
