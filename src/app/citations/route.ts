/* eslint-disable import/prefer-default-export */
// @ts-expect-error
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-doi';

export async function POST(request: Request) {
    const res = await request.json();

    const name = res.bibtex;
    // by passing the full bibtex to citation-js, we get sorting and formatting of references for free
    const parsedCitation = await Cite.async(name);

    const bibliography = parsedCitation.format('bibliography', {
        format: 'html',
        template: 'apa',
        lang: 'en-US',
        // @ts-expect-error citation-js is not typed
        prepend: (data) => `<li id="reference${data.id}">`,
        append: () => '</li>',
    });

    return Response.json({ bibliography });
}
