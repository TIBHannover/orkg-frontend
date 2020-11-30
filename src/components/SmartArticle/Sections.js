import { moveSection } from 'actions/smartArticle';
import Section from 'components/SmartArticle/Section';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SortableContainer } from 'react-sortable-hoc';
import { Container } from 'reactstrap';

const Sections = () => {
    const sections = useSelector(state => state.smartArticle.sections);
    const contributionId = useSelector(state => state.smartArticle.contributionId);
    const dispatch = useDispatch();

    const handleSortEnd = ({ oldIndex, newIndex }) => {
        //console.log('test sort end', sort);
        //const newProperties = arrayMove(properties, oldIndex, newIndex);
        //
        dispatch(moveSection({ contributionId, sections, oldIndex, newIndex }));
    };

    const SortableList = SortableContainer(({ items }) => {
        return (
            <Container>
                {items.map((section, index) => (
                    <Section key={section.title.id} index={index} section={section} atIndex={index + 1} />
                ))}
            </Container>
        );
    });

    return <SortableList items={sections} onSortEnd={handleSortEnd} lockAxis="y" useDragHandle />;
    //return sections.map((section, index) => <Section key={section.title.id} section={section} index={index + 1} />);
};

export default Sections;
