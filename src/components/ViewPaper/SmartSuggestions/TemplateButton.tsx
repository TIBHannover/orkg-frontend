import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import useSWR from 'swr';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import { getResource, resourcesUrl, updateResource } from '@/services/backend/resources';
import { Template } from '@/services/backend/types';

type TemplateButtonProps = {
    template: Template;
    isSmart?: boolean;
    isDisabled?: boolean;
    resourceId: string;
};

const TemplateButton: FC<TemplateButtonProps> = ({ template, isSmart = false, isDisabled, resourceId }) => {
    const [isSaving, setIsSaving] = useState(false);

    const { data: resource, mutate } = useSWR([resourceId, resourcesUrl, 'getResource'], ([params]) => getResource(params));

    const addTemplate = async () => {
        setIsSaving(true);
        if (resource && 'classes' in resource) {
            await updateResource(resourceId, { classes: [...(resource.classes ?? []), template.target_class.id] });
            mutate();
        }
        setIsSaving(false);
    };

    const deleteTemplate = async () => {
        setIsSaving(true);
        if (resource && 'classes' in resource) {
            await updateResource(resourceId, { classes: [...(resource.classes.filter((c) => c !== template.target_class.id) ?? [])] });
            mutate();
        }
        setIsSaving(false);
    };

    const addMode = (resource && 'classes' in resource && !resource?.classes?.includes(template.target_class.id)) || isDisabled;

    let variant: 'danger' | 'ghost' | 'outline' = 'danger';
    let buttonClassName = '';
    let iconBackground = 'var(--danger)';
    const iconColor = addMode && !isSmart ? 'var(--color-secondary)' : 'white';

    if (addMode) {
        variant = isSmart ? 'outline' : 'ghost';
        buttonClassName = isSmart ? 'button--orkg-smart' : '';
        iconBackground = isSmart ? 'var(--color-smart)' : 'color-mix(in srgb, var(--color-secondary) 25%, var(--surface))';
    }

    return (
        <TemplateTooltip id={template.id} disabled={isDisabled}>
            <span>
                <ButtonWithLoading
                    onClick={() => (addMode ? addTemplate() : deleteTemplate())}
                    isLoading={isSaving}
                    size="sm"
                    variant={variant}
                    isDisabled={isDisabled}
                    className={`mr-2 mb-2 relative pr-4 pl-9 rounded-full max-w-full text-left whitespace-normal h-auto min-h-8 py-1 ${buttonClassName} ${!isSmart ? 'border-0' : ''}`}
                >
                    <span
                        className="absolute left-0 top-0 h-full w-7 rounded-l-full flex items-center justify-center"
                        style={{ backgroundColor: iconBackground, color: iconColor }}
                    >
                        {!isSaving && addMode && <FontAwesomeIcon size="sm" icon={faPlus} />}
                        {!isSaving && !addMode && <FontAwesomeIcon size="sm" icon={faTimes} />}
                        {isSaving && <FontAwesomeIcon icon={faSpinner} spin />}
                    </span>
                    {template.label}
                </ButtonWithLoading>
            </span>
        </TemplateTooltip>
    );
};

export default TemplateButton;
