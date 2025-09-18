/* eslint-disable import/prefer-default-export */
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-bibjson';

import { Cite } from '@citation-js/core';

import { getReview } from '@/services/backend/reviews';

export async function POST(request: Request) {
    const res = await request.json();

    const id = res.reviewId;
    const { usedReferences } = res;
    const review = await getReview(id);

    const { references } = review;

    // Parse all references to get their IDs
    const parsedCitation = await Cite.async(references);
    const allReferenceIds = parsedCitation.data?.map((reference: { id: string }) => reference.id) || [];

    // Filter to only include references that are in usedReferences
    const filteredReferenceIds = allReferenceIds.filter((_id: string) => usedReferences.includes(_id));

    // Get only the references that match the used IDs
    const filteredReferences = parsedCitation.data?.filter((reference: { id: string }) => filteredReferenceIds.includes(reference.id)) || [];

    // Create a new Cite instance with only the filtered references
    const filteredCitation = new Cite(filteredReferences);
    const bibliography = filteredCitation.format('bibliography', {
        format: 'html',
        template: 'apa',
        lang: 'en-US',
        // @ts-expect-error citation-js is not typed
        prepend: (data) => `<li id="reference${data.id}">`,
        append: () => '</li>',
    });

    return Response.json({ bibliography });
}
