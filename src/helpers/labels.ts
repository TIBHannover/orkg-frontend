import { ENTITIES } from '@/constants/graphSettings';

type LabelledEntity = { id: string; label?: string | null; _class?: string; uri?: string | null };

/**
 * Fallback text for a thing without a label, e.g. 'No label (R123)'.
 * Things (resources, classes, predicates) show their URI when they have one, otherwise their ID.
 * Literals never have a URI, so they always show their ID.
 */
export const getMissingLabelText = (entity: LabelledEntity, { preferUri = true }: { preferUri?: boolean } = {}) => {
    const identifier = preferUri && entity._class !== ENTITIES.LITERAL && entity.uri ? entity.uri : entity.id;
    return `No label (${identifier})`;
};

/**
 * Thing label, or the 'No label (…)' fallback when the label is empty.
 */
export const getDisplayLabel = (entity: LabelledEntity) => entity.label || getMissingLabelText(entity);
