import { compact, flatten } from 'lodash';

import useEntities from '@/app/grid-editor/hooks/useEntities';
import useGridEditor from '@/app/grid-editor/hooks/useGridEditor';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import { convertPropertyShapeToSchema, getPropertyShapesByPredicateID, isLiteral } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { getConfigByClassId } from '@/constants/DataTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Thing } from '@/services/backend/things';

const useConstraints = () => {
    const { statements } = useGridEditor();
    const { entities } = useEntities();
    const { templates } = useTemplates();

    const getEntity = (subjectId: string) => {
        return entities?.find((e) => e.id === subjectId);
    };

    const getScopedTemplates = (subjectId: string) => {
        const entity = getEntity(subjectId);
        let classes: string[] = [];
        // Check if entity has classes property (only Resource type has it)
        if (entity && 'classes' in entity) {
            classes = entity.classes || [];
        }
        // Add class based on entity type
        if (entity?._class === ENTITIES.CLASS) {
            classes = [...classes, CLASSES.CLASS];
        } else if (entity?._class === ENTITIES.PREDICATE) {
            classes = [...classes, CLASSES.PREDICATE];
        } else if (entity?._class === ENTITIES.RESOURCE) {
            classes = [CLASSES.RESOURCE, ...classes];
        }
        return templates?.filter((t) => classes.includes(t.target_class.id));
    };

    const getScopedStatements = (subjectId: string) => {
        return flatten(statements).filter((s) => s.subject.id === subjectId);
    };

    const getPropertyShapes = (predicateId: string, subjectId: string) => {
        const scoppedTemplates = getScopedTemplates(subjectId);
        const propertyShapes = flatten(scoppedTemplates.map((t) => getPropertyShapesByPredicateID(t, predicateId)));
        return propertyShapes;
    };

    const canAddValue = (predicateId: string, subjectId: string) => {
        const propertyShapes = getPropertyShapes(predicateId, subjectId);
        const scoppedStatements = getScopedStatements(subjectId);

        let result = true;

        if (
            propertyShapes.find(
                (p) => p.max_count && scoppedStatements?.filter((s) => s.predicate.id === predicateId).length >= (p.max_count as number),
            )
        ) {
            result = false;
        }

        return result;
    };

    const getRanges = (predicateId: string, subjectId: string) => {
        const propertyShapes = getPropertyShapes(predicateId, subjectId);
        return compact(propertyShapes.map((ps) => ('class' in ps && ps.class) || ('datatype' in ps && ps.datatype)));
    };

    const isLiteralField = (predicateId: string, subjectId: string) => {
        const propertyShapes = getPropertyShapes(predicateId, subjectId);
        return isLiteral(propertyShapes);
    };

    const isValidValue = (predicateId: string, subjectId: string, value: Thing) => {
        const propertyShapes = getPropertyShapes(predicateId, subjectId);
        const ranges = getRanges(predicateId, subjectId);
        const range = ranges.length > 0 ? ranges[0] : undefined;
        const propertyShape = propertyShapes.length > 0 ? propertyShapes[0] : undefined;
        if (!range || !propertyShape) {
            return true;
        }
        const initialDataType = getConfigByClassId(range.id).type;
        const propertySchema = convertPropertyShapeToSchema(propertyShape);
        if (value._class === ENTITIES.LITERAL && 'datatype' in value) {
            return initialDataType === value.datatype && propertySchema.safeParse(value.label).success;
        }
        if (value._class === ENTITIES.RESOURCE) {
            if ('classes' in value && (value.classes.includes(range.id) || range.id === CLASSES.RESOURCE)) {
                return true;
            }
            return false;
        }
        return false;
    };

    return {
        canAddValue,
        isLiteralField,
        getRanges,
        getPropertyShapes,
        isValidValue,
        getScopedTemplates,
    };
};

export default useConstraints;
