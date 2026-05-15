import { FC } from 'react';

import TemplateButton from '@/app/grid-editor/components/TemplatesModal/TemplateButton/TemplateButton';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import SharedTemplateListItem from '@/components/TemplatesModal/TemplateListItem/TemplateListItem';
import { Template } from '@/services/backend/types';

type TemplateListItemProps = {
    template: Template;
    isDisabled?: boolean;
};

const TemplateListItem: FC<TemplateListItemProps> = ({ template, isDisabled }) => {
    const { commonClasses } = useEntities();
    const isApplied = commonClasses.includes(template.target_class.id);

    return (
        <SharedTemplateListItem
            template={template}
            isApplied={isApplied}
            action={<TemplateButton template={template} isDisabled={isDisabled} iconOnly />}
        />
    );
};

export default TemplateListItem;
