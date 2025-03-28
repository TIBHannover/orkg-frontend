import { http, HttpResponse } from 'msw';

import { tablesUrl } from '@/services/backend/tables';
import { tableResource } from '@/services/mocks/backend/__mocks__/Tables';

const tables = [
    http.get(`${tablesUrl}:id`, ({ params }) => {
        const { id } = params as { id: string };
        if (!id) {
            throw new Error();
        }
        const MAPPING: Record<string, typeof tableResource> = {
            TableResource: tableResource,
        };
        if (MAPPING[id]) {
            return HttpResponse.json(MAPPING[id]);
        }
        return HttpResponse.json({ root: id, statements: [] });
    }),
];

export default tables;
