import { http, HttpResponse } from 'msw';

import { wikidataUrl } from '@/services/wikidata';

const searchEntity = ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    if (type === 'item') {
        return HttpResponse.json({
            searchinfo: {
                search: 'resource label 1',
            },
            search: [],
            success: 1,
        });
    }
    if (type === 'property') {
        return HttpResponse.json({ searchinfo: { search: 'property label 1' }, search: [], success: 1 });
    }
    return HttpResponse.json({
        searchinfo: {
            search: 'resource label 1',
        },
        search: [],
        success: 1,
    });
};

const wikidata = [http.get(`${wikidataUrl}*`, searchEntity)];

export default wikidata;
