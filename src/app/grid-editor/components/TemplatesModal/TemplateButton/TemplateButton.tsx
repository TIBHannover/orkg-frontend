import { faPlus, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn } from '@heroui/react';
import { FC, useState } from 'react';
import { mutate } from 'swr';

import useEntities from '@/app/grid-editor/hooks/useEntities';
import TemplateTooltip from '@/components/TemplateTooltip/TemplateTooltip';
import { updateResource } from '@/services/backend/resources';
import { Resource, Template } from '@/services/backend/types';

type TemplateButtonProps = {
    template: Template;
    isSmart?: boolean;
    isDisabled?: boolean;
    iconOnly?: boolean;
};

const TemplateButton: FC<TemplateButtonProps> = ({ template, isSmart = false, isDisabled, iconOnly = false }) => {
    const [isSaving, setIsSaving] = useState(false);
    const { entities, key, commonClasses } = useEntities();

    const addMode = !commonClasses.includes(template.target_class.id) || isDisabled;

    const handleClick = async () => {
        setIsSaving(true);
        await Promise.all(
            entities?.map(async (entity) => {
                if (entity && 'classes' in entity) {
                    const existing = (entity as Resource).classes ?? [];
                    const next = addMode ? [...existing, template.target_class.id] : existing.filter((c) => c !== template.target_class.id);
                    await updateResource(entity.id, { classes: next });
                }
            }) ?? [],
        );
        mutate(key);
        setIsSaving(false);
    };

    let badgeBg: string;
    let badgeFg: string;
    let buttonCls: string;

    if (!addMode) {
        badgeBg = 'var(--danger)';
        badgeFg = 'var(--danger-foreground)';
        buttonCls = 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/15';
    } else if (isSmart) {
        badgeBg = 'var(--color-smart)';
        badgeFg = 'white';
        buttonCls = 'bg-smart/10 text-smart-darker border border-smart/30 hover:bg-smart/15 dark:text-smart';
    } else {
        badgeBg = 'var(--color-secondary)';
        badgeFg = 'white';
        buttonCls = 'bg-secondary/15 text-secondary-darker border border-secondary/30 hover:bg-secondary/25 dark:text-secondary';
    }

    const icon = isSaving ? faSpinner : addMode ? faPlus : faTimes;

    if (iconOnly) {
        return (
            <TemplateTooltip id={template.id} disabled={isDisabled}>
                <span className="inline-block">
                    <Button
                        onPress={handleClick}
                        isDisabled={isDisabled || isSaving}
                        size="sm"
                        isIconOnly
                        aria-label={addMode ? `Add template ${template.label}` : `Remove template ${template.label}`}
                        className="h-8 w-8 min-w-8 rounded-full"
                        style={{ backgroundColor: badgeBg, color: badgeFg }}
                    >
                        <FontAwesomeIcon size="sm" icon={icon} spin={isSaving} />
                    </Button>
                </span>
            </TemplateTooltip>
        );
    }

    return (
        <TemplateTooltip id={template.id} disabled={isDisabled}>
            <span className="inline-block">
                <Button
                    onPress={handleClick}
                    isDisabled={isDisabled || isSaving}
                    size="sm"
                    className={cn('mr-2 mb-2 relative rounded-full pl-9 pr-4 h-8 font-normal', buttonCls)}
                >
                    <span
                        className="absolute left-0 top-0 h-full w-7 flex items-center justify-center rounded-l-full"
                        style={{ backgroundColor: badgeBg, color: badgeFg }}
                    >
                        <FontAwesomeIcon size="sm" icon={icon} spin={isSaving} />
                    </span>
                    {template.label}
                </Button>
            </span>
        </TemplateTooltip>
    );
};

export default TemplateButton;
