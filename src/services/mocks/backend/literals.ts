import { MISC } from 'constants/graphSettings';
import { http, HttpResponse } from 'msw';
import { literalsUrl } from 'services/backend/literals';
import db from 'services/mocks/db';
import { createMSWLiteral } from 'services/mocks/helpers';

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
    return HttpResponse.json(updatedLiteral);
};

const literalPost = async ({ request }: { request: Request }) => {
    const { label, datatype = MISC.DEFAULT_LITERAL_DATATYPE } = await request.json();
    const createdLiteral = createMSWLiteral({
        label,
        datatype,
    });
    return HttpResponse.json(createdLiteral);
};

const literals = [http.put(`${literalsUrl}:id`, literalPut), http.post(literalsUrl, literalPost)];

export default literals;
