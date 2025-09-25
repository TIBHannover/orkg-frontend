import { flatMap, uniq, uniqBy } from 'lodash';
import useSWR from 'swr';

import useEntities from '@/app/grid-editor/hooks/useEntities';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { getTemplates, templatesUrl } from '@/services/backend/templates';

const useTemplates = () => {
    const { entities, isLoading: isLoadingEntities } = useEntities();

    // Extract classes from all entities
    const allClasses = flatMap(entities, (entity) => {
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

        return classes;
    });

    // Deduplicate classes
    const uniqueClasses = uniq(allClasses);

    const { data: templates, isLoading } = useSWR(uniqueClasses.length > 0 ? [uniqueClasses, templatesUrl, 'getTemplates'] : null, ([params]) =>
        Promise.all(params.map((id: string) => getTemplates({ targetClass: id }))),
    );

    // Deduplicate templates by id
    const allTemplates = flatMap(templates, (response) => response.content);
    const uniqueTemplates = uniqBy(allTemplates, 'id');

    return { isLoading: isLoadingEntities || isLoading, templates: uniqueTemplates };
};

export default useTemplates;
