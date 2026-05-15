import { FC } from 'react';

import TemplateButton from '@/components/DataBrowser/components/TemplatesModal/TemplateButton/TemplateButton';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import SharedTemplateListItem from '@/components/TemplatesModal/TemplateListItem/TemplateListItem';
import { Template } from '@/services/backend/types';

type TemplateListItemProps = {
    template: Template;
    isDisabled?: boolean;
};

const TemplateListItem: FC<TemplateListItemProps> = ({ template, isDisabled }) => {
    const { entity } = useEntity();
    const isApplied = Boolean(entity && 'classes' in entity && entity?.classes?.includes(template.target_class.id));

    return (
        <SharedTemplateListItem
            template={template}
            isApplied={isApplied}
            action={<TemplateButton template={template} isDisabled={isDisabled} iconOnly />}
        />
    );
};

export default TemplateListItem;
