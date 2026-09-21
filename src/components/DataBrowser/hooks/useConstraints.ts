import { compact, flatten } from 'lodash';

import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import { getPropertyShapesByPredicateID, isLiteral } from '@/components/DataBrowser/utils/dataBrowserUtils';

const useConstraints = (predicateId: string) => {
    const { statements } = useEntity();

    const { templates } = useTemplates();

    const propertyShapes = flatten(templates.map((t) => getPropertyShapesByPredicateID(t, predicateId)));

    let canAddValue = true;

    if (propertyShapes.find((p) => p.maxCount && statements && statements?.filter((s) => s.predicate.id === predicateId).length >= p.maxCount)) {
        canAddValue = false;
    }

    const isLiteralField = isLiteral(propertyShapes);

    return {
        canAddValue,
        isLiteralField,
        propertyShapes,
        // the generated client escapes the wire field 'class' as '_class'
        ranges: compact(propertyShapes.map((ps) => (ps.type === 'resource' && ps._class) || ('datatype' in ps && ps.datatype))),
    };
};

export default useConstraints;
