import ky from 'ky';
import { env } from 'next-runtime-env';

const smartFilters = ky.create({
    prefixUrl: env('NEXT_PUBLIC_SMART_FILTERS_URL'),
    timeout: 1000 * 60 * 20, // 20 minutes
});

// Faceted Response interface
interface FacetValue {
    facet_value: string;
    frequency: number;
    paper_Ids: string[];
}

interface FacetValuePair {
    facet: string;
    facet_values: FacetValue[];
}

interface FacetedResponse {
    uuid: string;
    timestamp: string;
    payload: {
        facet_value_pairs: FacetValuePair[];
    };
}

type SmartFiltersRequest = {
    question: string;
    items_ids: string[];
    items_abstracts: string[];
};

export async function getSmartFilters({ question, items_ids, items_abstracts }: SmartFiltersRequest): Promise<FacetedResponse> {
    // Sending data in the request body as JSON
    const response = await smartFilters.post('llm/extract/smart_filters', {
        json: { question, items_ids, items_abstracts },
    });

    // Ensure response is returned in the expected format
    return response.json();
}
