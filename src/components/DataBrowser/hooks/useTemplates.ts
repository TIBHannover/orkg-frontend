import useSWR from 'swr';

import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { getTemplates, templatesUrl } from '@/services/backend/templates';

const useTemplates = () => {
    const { entity, isLoadingEntity } = useEntity();

    let classes = entity && 'classes' in entity ? entity?.classes : [];
    if (entity?._class === ENTITIES.CLASS) {
        classes = [CLASSES.CLASS];
    } else if (entity?._class === ENTITIES.PREDICATE) {
        classes = [CLASSES.PREDICATE];
    } else if (entity?._class === ENTITIES.RESOURCE) {
        classes = [CLASSES.RESOURCE, ...classes];
    }
    const { data: templates, isLoading } = useSWR(classes.length > 0 ? [classes, templatesUrl, 'getTemplates'] : null, ([params]) =>
        Promise.all(params.map((id: string) => getTemplates({ targetClass: id }))),
    );

    return { isLoading: isLoadingEntity || isLoading, templates: templates?.map((c) => c.content).flat() ?? [] };
};

export default useTemplates;
