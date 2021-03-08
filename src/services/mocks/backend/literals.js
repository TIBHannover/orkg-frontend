import { rest } from 'msw';
import { literalsUrl } from 'services/backend/literals';
import { MISC } from 'constants/graphSettings';

const literalPostAndPut = (req, res, ctx) => {
    const { label, datatype = MISC.DEFAULT_LITERAL_DATATYPE } = req.body;
    const { id } = req.params;

    return res(
        ctx.json({
            id,
            label,
            datatype,
            created_at: '2020-06-18T12:37:02.422347Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'literal'
        })
    );
};

const literals = [rest.put(`${literalsUrl}:id`, literalPostAndPut), rest.post(literalsUrl, literalPostAndPut)];

export default literals;
