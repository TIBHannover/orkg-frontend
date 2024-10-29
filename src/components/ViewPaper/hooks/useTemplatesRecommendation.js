import { CLASSES } from 'constants/graphSettings';
import { differenceBy } from 'lodash';
import { getResource, resourcesUrl } from 'services/backend/resources';
import { getTemplate, getTemplates, templatesUrl } from 'services/backend/templates';
import { getTemplateRecommendations, nlpServiceUrl } from 'services/orkgNlp';
import useSWR from 'swr';

const useTemplatesRecommendation = ({ title, abstract, resourceId }) => {
    const { data: resource } = useSWR([resourceId, resourcesUrl, 'getResource'], ([params]) => getResource(params));

    const { data: templates } = useSWR(
        resource && 'classes' in resource && resource.classes.length > 0 ? [resource.classes, templatesUrl, 'getTemplates'] : null,
        ([params]) => Promise.all(params.map((id) => getTemplates({ targetClass: id }))),
    );

    const { data, isLoading: isLoadingRT } = useSWR(
        title || abstract ? [{ title, abstract }, nlpServiceUrl, 'getTemplateRecommendations'] : null,
        ([params]) => getTemplateRecommendations(params),
    );
    const templateRecommendations = data?.templates ?? [];
    const usedTemplates = templates?.map((c) => c.content).flat() ?? [];

    const recommendedTemplatesIds = differenceBy(templateRecommendations ?? [], usedTemplates ?? [], 'id');

    const { data: recommendedTemplates } = useSWR(
        recommendedTemplatesIds && recommendedTemplatesIds.length > 0 ? [recommendedTemplatesIds, templatesUrl, 'getTemplates'] : null,
        ([params]) => Promise.all(params.map((t) => getTemplate(t.id))),
    );

    return {
        isContributionLevel: resource && 'classes' in resource && resource.classes.includes(CLASSES.CONTRIBUTION),
        recommendedTemplates: recommendedTemplates ?? [],
        isLoadingRT,
    };
};

export default useTemplatesRecommendation;
