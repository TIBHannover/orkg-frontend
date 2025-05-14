import { http, HttpResponse } from 'msw';

import { MISC } from '@/constants/graphSettings';
import { literalsUrl } from '@/services/backend/literals';
import db from '@/services/mocks/db';
import { createMSWLiteral } from '@/services/mocks/helpers';

const literalPut = async ({ request, params }: { request: Request; params: { id?: string } }) => {
    const { label, datatype = MISC.DEFAULT_LITERAL_DATATYPE } = await request.json();
    const { id } = params;
    const updatedLiteral = db.literals.update({
        where: {
            id: {
                equals: id,
            },
        },
        data: {
            label,
            datatype,
        },
    });
    return new HttpResponse(null, {
        headers: {
            Location: `${literalsUrl}${updatedLiteral?.id}`,
        },
    });
};

const literalPost = async ({ request }: { request: Request }) => {
    const { label, datatype = MISC.DEFAULT_LITERAL_DATATYPE } = await request.json();
    const createdLiteral = createMSWLiteral({
        label,
        datatype,
    });
    return new HttpResponse(null, {
        headers: {
            Location: `${literalsUrl}${createdLiteral?.id}`,
        },
    });
};

const literals = [
    http.get(`${literalsUrl}:id`, ({ params }) => {
        const { id } = params as { id: string };
        const literalItem = db.literals.findFirst({
            where: {
                id: {
                    equals: id,
                },
            },
        });
        if (!literalItem) {
            return HttpResponse.json({
                id: `L${id}`,
                label: 'Literal label',
                datatype: MISC.DEFAULT_LITERAL_DATATYPE,
                created_at: '2020-06-03T20:21:11.980177+02:00',
                created_by: '1ce9b643-32aa-439a-8237-058342cc2b6a',
                _class: 'class',
                description: null,
            });
        }
        return HttpResponse.json(literalItem);
    }),
    http.put(`${literalsUrl}:id`, literalPut),
    http.post(literalsUrl, literalPost),
];

export default literals;
