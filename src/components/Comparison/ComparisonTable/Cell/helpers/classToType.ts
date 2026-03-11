import { ENTITIES } from '@/constants/graphSettings';

const classToType = {
    resource_ref: ENTITIES.RESOURCE,
    predicate_ref: ENTITIES.PREDICATE,
    literal_ref: ENTITIES.LITERAL,
    class_ref: ENTITIES.CLASS,
};

export default classToType;
