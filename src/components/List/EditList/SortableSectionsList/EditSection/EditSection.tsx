import { FC } from 'react';
import { SortableElement } from 'react-sortable-hoc';

import SortableSection from '@/components/ArticleBuilder/SortableSection/SortableSection';
import Confirm from '@/components/Confirmation/Confirmation';
import AddSection from '@/components/List/EditList/AddSection/AddSection';
import EditSectionList from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionList/EditSectionList';
import EditSectionText from '@/components/List/EditList/SortableSectionsList/EditSection/EditSectionText/EditSectionText';
import { HandleManualSort } from '@/components/List/EditList/SortableSectionsList/SortableSectionsList';
import { isListSection, isTextSection } from '@/components/List/helpers/typeGuards';
import useList from '@/components/List/hooks/useList';
import { LiteratureListSection } from '@/services/backend/types';

type EditSectionProps = {
    section: LiteratureListSection;
    atIndex: number;
    handleManualSort: HandleManualSort;
};

const EditSection: FC<EditSectionProps> = ({ section, handleManualSort, atIndex }) => {
    const { list, deleteSection } = useList();

    if (!list) {
        return null;
    }

    const handleDelete = async () => {
        const confirm = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this section?',
        });

        if (confirm) {
            deleteSection(section.id);
        }
    };

    return (
        <section>
            <SortableSection handleDelete={handleDelete} handleSort={(direction) => handleManualSort({ id: section.id, direction })}>
                {isTextSection(section) && <EditSectionText section={section} />}
                {isListSection(section) && <EditSectionList section={section} index={atIndex - 1} />}
            </SortableSection>
            <AddSection index={atIndex} />
        </section>
    );
};

export default SortableElement<EditSectionProps>(EditSection);
