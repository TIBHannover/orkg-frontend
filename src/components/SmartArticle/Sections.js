import { moveSection } from 'actions/smartArticle';
import Section from 'components/SmartArticle/Section';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableContainer } from 'react-sortable-hoc';
import { Container } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';

const SortableList = SortableContainer(({ items }) => (
    <Container>
        {items.map((section, index) => (
            <Section key={section.title.id} index={index} section={section} atIndex={index + 1} />
        ))}
    </Container>
));

const GlobalStyle = createGlobalStyle`
    .is-dragging {
        opacity: 0.7;
    }
`;

const Sections = () => {
    const sections = useSelector(state => state.smartArticle.sections);
    const contributionId = useSelector(state => state.smartArticle.contributionId);
    const [isSorting, setIsSorting] = useState(false);
    const dispatch = useDispatch();

    const handleSortEnd = ({ oldIndex, newIndex }) => {
        dispatch(moveSection({ contributionId, sections, oldIndex, newIndex }));
        setIsSorting(false);
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
            />
        </div>
    );
};

export default Sections;
