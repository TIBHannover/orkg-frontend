import useSWR from 'swr';

import { getTemplates, templatesUrl } from '@/services/backend/templates';
import { Resource } from '@/services/backend/types';

type UseUsedTemplates = {
    resource?: Resource;
};

const useUsedTemplates = ({ resource = undefined }: UseUsedTemplates) => {
    const { data: usedTemplates, isLoading } = useSWR(
        resource?.classes && resource?.classes?.length > 0 ? [resource?.classes, templatesUrl, 'getTemplates'] : null,
        ([params]) => Promise.all(params.map((c) => getTemplates({ targetClass: c }))),
    );

    const _usedTemplates = usedTemplates
        ?.filter((t) => t.content.length > 0)
        .map((t) => t.content[0])
        .flat();

    return {
        usedTemplates: _usedTemplates,
        isLoading,
    };
};

export default useUsedTemplates;
