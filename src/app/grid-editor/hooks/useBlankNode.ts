import useSWR from 'swr';

import { LITERAL_DATA_TYPES_CLASS_IDS } from '@/constants/DataTypes';
import { createResource } from '@/services/backend/resources';
import { getTemplates, templatesUrl } from '@/services/backend/templates';
import { Node } from '@/services/backend/types';

const useBlankNode = (ranges: Node[]) => {
    const rangesNoLiterals = ranges.filter((r) => !LITERAL_DATA_TYPES_CLASS_IDS.includes(r.id));

    const { data, isLoading } = useSWR(rangesNoLiterals.length > 0 ? [rangesNoLiterals, templatesUrl, 'getTemplates'] : null, ([params]) =>
        Promise.all(params.map((r) => getTemplates({ targetClass: r.id }))),
    );

    const templates = data?.map((c) => c.content).flat() ?? [];
    const isBlankNode = (templates && templates?.filter((t) => t.formatted_label).length > 0) ?? false;
    const blankNodeLabel = (templates && templates?.filter((t) => t.formatted_label).map((t) => t.label)?.[0]) ?? null;

    const createBlankNode = async () => {
        const newResourceId = await createResource({ label: blankNodeLabel, classes: ranges.map((r) => r.id) });

        return newResourceId;
    };

    return { isBlankNode, createBlankNode, blankNodeLabel, isLoadingTemplates: isLoading };
};

export default useBlankNode;
