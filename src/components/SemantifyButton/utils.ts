import { compact } from 'lodash';
import { SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import { convertPropertyShapeToSchema, getPropertyShapesByPredicateID } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { DataType, getConfigByType } from '@/constants/DataTypes';
import { Statement, Template } from '@/services/backend/types';

export type Item = {
    value: string;
    resource: SingleValue<OptionType> | null;
    type: DataType;
    inputValue?: string;
};

export const getRestrictingTemplate = (templates: Template[], statement: Statement) => {
    for (const template of templates) {
        if (getPropertyShapesByPredicateID(template, statement.predicate.id).length > 0) {
            return template;
        }
    }
    return undefined;
};

export const getCanAddValueCount = (template: Template, statement: Statement, currentPathStatements: Statement[]) => {
    const propertyShapes = template ? getPropertyShapesByPredicateID(template, statement.predicate.id) : [];
    let canAddValue: number | undefined;
    if (propertyShapes.find((p) => p.max_count)) {
        const maxCount = propertyShapes.find((p) => p.max_count)?.max_count as number;
        const currentCount = (currentPathStatements || [])?.filter((s) => s.predicate.id === statement.predicate.id).length;
        canAddValue = maxCount - currentCount;
    }
    return canAddValue;
};

export const validateValue = (template: Template | undefined, value: Item, predicateId: string) => {
    if (template) {
        const propertyShapes = getPropertyShapesByPredicateID(template, predicateId);
        const propertyShape = propertyShapes.length > 0 ? propertyShapes[0] : undefined;
        const { schema } = getConfigByType(value.type.type);
        const propertySchema = propertyShape ? convertPropertyShapeToSchema(propertyShape) : schema;
        let error;
        if (schema) {
            error = schema.safeParse(value.inputValue?.trim()).error;
        }
        if (error) {
            return false;
        }
        if (propertySchema) {
            error = propertySchema.safeParse(value.inputValue?.trim()).error;
        }
        if (error) {
            return false;
        }
        return true;
    }

    const { schema } = getConfigByType(value.type.type);
    if (schema && !value.resource) {
        const { error } = schema.safeParse(value.inputValue?.trim());
        if (error) {
            return false;
        }
    }
    if (!value.resource && !value.inputValue?.trim()) {
        return false;
    }
    return true;
};

export const getRange = (template: Template, statement: Statement) => {
    const propertyShapes = template ? getPropertyShapesByPredicateID(template, statement.predicate.id) : [];
    const ranges = compact(propertyShapes.map((ps) => ('class' in ps && ps.class) || ('datatype' in ps && ps.datatype)));
    return ranges?.[0];
};
