import { CreateVisualizationRequest, VisualizationsApi, VisualizationsApiFindAllRequest } from '@orkg/orkg-client';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId, transformPaginationParams } from '@/services/backend/backendApi';
import { toAuthorRequest } from '@/services/backend/mapAuthor';
import { CreateVisualizationParams, VisibilityParam, WithPaginationParams } from '@/services/backend/types';

export const visualizationsUrl = `${urlNoTrailingSlash}/visualizations`;

const visualizationsApi = new VisualizationsApi(configuration);

export const getVisualization = (id: string) => visualizationsApi.findById({ id });

export const getVisualizations = ({
    visibility = VISIBILITY_FILTERS.ALL_LISTED,
    ...params
}: Omit<WithPaginationParams<VisualizationsApiFindAllRequest>, 'visibility'> & VisibilityParam) =>
    visualizationsApi.findAll(
        transformPaginationParams({
            ...params,
            // the app-level filter includes 'combined' (TOP_RECENT); getContentTypes splits it
            // into FEATURED + NON_FEATURED before it can reach here
            visibility: visibility as VisualizationsApiFindAllRequest['visibility'],
        }),
    );

export const createVisualization = (data: CreateVisualizationParams): Promise<string> =>
    visualizationsApi
        .createRaw({ createVisualizationRequest: { ...data, authors: data.authors.map(toAuthorRequest) } as CreateVisualizationRequest })
        .then(getCreatedId);
