import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import { getTemplate, templatesUrl } from 'services/backend/templates';
import { getTemplateRecommendations, nlpServiceUrl } from 'services/orkgNlp';
import useSWR from 'swr';

const useRecommendedTemplates = () => {
    const { context } = useDataBrowserState();
    const { title, abstract } = context;

    const { data: templates } = useSWR(
        title || abstract ? [{ title: title ?? '', abstract: abstract ?? '' }, nlpServiceUrl, 'getFeaturedTemplates'] : null,
        ([params]) => getTemplateRecommendations(params),
    );

    const { data: recommendedTemplates, isLoading } = useSWR(
        templates && templates.templates.length > 0 ? [templates.templates, templatesUrl, 'getTemplates'] : null,
        ([params]) => Promise.all(params.map((template) => getTemplate(template.id))),
    );

    return {
        recommendedTemplates,
        isLoading,
    };
};

export default useRecommendedTemplates;
