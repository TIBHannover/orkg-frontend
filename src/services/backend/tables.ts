import { url } from 'constants/misc';
import backendApi from 'services/backend/backendApi';
import { ExtractionMethod, Visibility } from 'services/backend/types';

export const tablesUrl = `${url}tables/`;
export const tablesApi = backendApi.extend(() => ({ prefixUrl: tablesUrl }));
const TABLES_CONTENT_TYPE = 'application/vnd.orkg.table.v1+json';

type Table = {
    id: string;
    label: string;
    rows: {
        data: {
            _class: string;
            datatype: string;
            label: string;
            id: string | null;
        }[];
        label: string | null;
    }[];
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
    created_at: string;
    created_by: string;
    visibility: Visibility;
    unlisted_by: string | null;
};

export const getTable = (id: string) =>
    tablesApi
        .get<Table>(id, {
            headers: {
                'Content-Type': TABLES_CONTENT_TYPE,
                Accept: TABLES_CONTENT_TYPE,
            },
        })
        .json();
