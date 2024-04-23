import { http } from 'msw';
import { wikidataUrl } from 'services/wikidata/index';

const searchEntity = (req, res, ctx) => res(ctx.json({ searchinfo: { search: 'property label 1' }, search: [], success: 1 }));
const wikidata = [http.get(`${wikidataUrl}*`, searchEntity)];

export default wikidata;
