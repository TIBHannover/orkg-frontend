import { TemplatePropertyRequest } from '@orkg/orkg-client';

import { CLASSES } from '@/constants/graphSettings';
import { PropertyShapeCreateParams } from '@/services/backend/types';

// the editor and the payload builders only produce number constraints for these two datatypes
// (see ValidationRulesNumber's gate); keep this set in sync with them, since listing a datatype
// here makes the mapper emit explicit nulls that clear existing constraints on the backend
const NUMBER_DATATYPES = new Set<string>([CLASSES.INTEGER, CLASSES.DECIMAL]);

const toNumber = <Empty extends null | undefined>(value: number | string | null | undefined, empty: Empty): number | Empty => {
    if (value === null || value === undefined || value === '') {
        return empty;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : empty;
};

// the generated TemplatePropertyRequest union is matched by instanceOf on required keys per
// variant (pattern / minInclusive+maxInclusive / datatype / _class). spreading the editor
// payload leaves leftover keys and string counts, so the serializer can pick the wrong
// variant or drop constraints — build an exact object per variant instead
export const toTemplatePropertyRequest = (property: PropertyShapeCreateParams): TemplatePropertyRequest => {
    const minCount = toNumber(property.minCount, undefined);
    const maxCount = toNumber(property.maxCount, undefined);
    const base = {
        // the editor leaves these null when unset and the backend stores null; the generated
        // type declares them as required strings, so "" would be the typed choice — but it is
        // stored verbatim, which would leave new properties holding "" where every existing one
        // holds null
        label: property.label ?? '',
        description: (property.description ?? null) as string,
        placeholder: (property.placeholder ?? null) as string,
        path: property.path,
        ...(minCount !== undefined ? { minCount } : {}),
        ...(maxCount !== undefined ? { maxCount } : {}),
    };

    if (property.datatype === CLASSES.STRING) {
        return {
            ...base,
            datatype: property.datatype,
            pattern: property.pattern ?? null,
        };
    }

    if (property.datatype && NUMBER_DATATYPES.has(property.datatype)) {
        return {
            ...base,
            datatype: property.datatype,
            minInclusive: toNumber(property.minInclusive, null),
            maxInclusive: toNumber(property.maxInclusive, null),
        };
    }

    if (property.datatype) {
        return {
            ...base,
            datatype: property.datatype,
        };
    }

    if (property._class) {
        return {
            ...base,
            _class: property._class,
        };
    }

    return base;
};
