import { http } from 'msw';
import { literalsUrl } from 'services/backend/literals';
import { MISC } from 'constants/graphSettings';

const literalPostAndPut = async (req, res, ctx) => {
    const { label, datatype = MISC.DEFAULT_LITERAL_DATATYPE } = await req.json();
    const { id } = req.params;

    return res(
        ctx.json({
            id,
            label,
            datatype,
            created_at: '2020-06-18T12:37:02.422347Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'literal',
        }),
    );
};

const literals = [http.put(`${literalsUrl}:id`, literalPostAndPut), http.post(literalsUrl, literalPostAndPut)];

export default literals;
