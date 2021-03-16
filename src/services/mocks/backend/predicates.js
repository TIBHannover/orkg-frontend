import { rest } from 'msw';
import { predicatesUrl } from 'services/backend/predicates';

const predicates = [
    rest.get(`${predicatesUrl}:id`, (req, res, ctx) => {
        const { id } = req.params;

        return res(
            ctx.json({
                id,
                label: id,
                created_at: '2020-06-22T10:38:53.178764Z',
                classes: [],
                shared: 0,
                created_by: '00000000-0000-0000-0000-000000000000',
                _class: 'predicate',
                observatory_id: '00000000-0000-0000-0000-000000000000',
                extraction_method: 'UNKNOWN',
                organization_id: '00000000-0000-0000-0000-000000000000'
            })
        );
    })
];

export default predicates;
