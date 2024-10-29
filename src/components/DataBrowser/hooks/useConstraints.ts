import { getPropertyShapesByPredicateID, isLiteral } from 'components/DataBrowser/utils/dataBrowserUtils';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useTemplates from 'components/DataBrowser/hooks/useTemplates';
import { compact, flatten } from 'lodash';

const useConstraints = (predicateId: string) => {
    const { statements } = useEntity();

    const { templates } = useTemplates();

    const propertyShapes = flatten(templates.map((t) => getPropertyShapesByPredicateID(t, predicateId)));

    let canAddValue = true;

    if (
        propertyShapes.find(
            (p) => p.max_count && statements && statements?.filter((s) => s.predicate.id === predicateId).length >= (p.max_count as number),
        )
    ) {
        canAddValue = false;
    }

    const isLiteralField = isLiteral(propertyShapes);

    return {
        canAddValue,
        isLiteralField,
        propertyShapes,
        ranges: compact(propertyShapes.map((ps) => ('class' in ps && ps.class) || ('datatype' in ps && ps.datatype))),
    };
};

export default useConstraints;
