import ky, { ResponsePromise } from 'ky';
import { env } from 'next-runtime-env';

export const smartFiltersUrl = env('NEXT_PUBLIC_SMART_FILTERS_URL');

const smartFilters = ky.create({
    prefixUrl: smartFiltersUrl,
    timeout: 1000 * 60 * 20, // 20 minutes
});

// Faceted Response interface
export type FacetValue = {
    facet_value: string;
    frequency: number;
    paper_Ids: string[];
};

export type FacetValuePair = {
    facet: string;
    facet_values: FacetValue[];
};

export type FacetedResponse = {
    uuid: string;
    timestamp: string;
    payload: {
        facet_value_pairs: FacetValuePair[];
    };
};

type SmartFiltersRequest = {
    question: string;
    items_ids: string[];
    items_abstracts: string[];
};

export const getSmartFilters = ({ question, items_ids, items_abstracts }: SmartFiltersRequest): Promise<FacetedResponse> => {
    return smartFilters
        .post<FacetedResponse>('llm/extract/filters', {
            json: { question, items_ids, items_abstracts },
        })
        .json();
};
