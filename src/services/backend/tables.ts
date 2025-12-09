import { url } from '@/constants/misc';
import backendApi, { getCreatedIdFromHeaders } from '@/services/backend/backendApi';
import { ExtractionMethod, NewClass, NewList, NewLiteral, NewPredicate, NewResource, Visibility } from '@/services/backend/types';

export const tablesUrl = `${url}tables/`;
export const tablesApi = backendApi.extend(() => ({ prefixUrl: tablesUrl }));
const TABLES_CONTENT_TYPE = 'application/vnd.orkg.table.v1+json';
const TABLE_COLUMN_CONTENT_TYPE = 'application/vnd.orkg.table.column.v1+json';
const TABLE_ROW_CONTENT_TYPE = 'application/vnd.orkg.table.row.v1+json';
const TABLE_CELL_CONTENT_TYPE = 'application/vnd.orkg.table.cell.v1+json';

export type TableCell = {
    id: string | null;
    _class: string;
    datatype: string;
    label: string;
} | null;

export type Table = {
    id: string;
    label: string;
    rows: {
        data: TableCell[];
        label: string | null;
    }[];
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
    created_at: string;
    created_by: string;
    visibility: Visibility;
    modifiable: boolean;
    unlisted_by: string | null;
};

export type TempIds = {
    resources: {
        [key: string]: NewResource;
    };
    literals: {
        [key: string]: NewLiteral;
    };
    predicates: {
        [key: string]: NewPredicate;
    };
    lists: {
        [key: string]: NewList;
    };
    classes: {
        [key: string]: NewClass;
    };
};

export type CreateTableParams = {
    label: string;
    rows: {
        data: (string | null)[];
        label: string | null;
    }[];
    organizations: string[];
    observatories: string[];
    extraction_method: ExtractionMethod;
} & TempIds;

type UpdateTableParams = Partial<CreateTableParams>;

export const getTable = (id: string) => {
    return tablesApi
        .get<Table>(id, {
            headers: {
                'Content-Type': TABLES_CONTENT_TYPE,
                Accept: TABLES_CONTENT_TYPE,
            },
        })
        .json();
};

export const createTable = (data: CreateTableParams): Promise<string> =>
    tablesApi
        .post<Table>('', {
            json: data,
            headers: {
                'Content-Type': TABLES_CONTENT_TYPE,
                Accept: TABLES_CONTENT_TYPE,
            },
        })
        .then(({ headers }) => getCreatedIdFromHeaders(headers));

export const updateTable = (id: string, data: UpdateTableParams) =>
    tablesApi
        .put<Table>(id, {
            json: data,
            headers: {
                'Content-Type': TABLES_CONTENT_TYPE,
                Accept: TABLES_CONTENT_TYPE,
            },
        })
        .json();

export const updateCell = (id: string, row: number, column: number, cellId: string | null) =>
    tablesApi
        .put<Table>(`${id}/cells/${row}/${column}`, {
            json: {
                id: cellId,
            },
            headers: {
                'Content-Type': `${TABLE_CELL_CONTENT_TYPE};charset=UTF-8`,
                Accept: TABLE_CELL_CONTENT_TYPE,
            },
        })
        .json();

export const updateTableColumn = (id: string, index: number, data: TempIds & { column: (string | null)[] }) =>
    tablesApi
        .put<Table>(`${id}/columns/${index}`, {
            json: data,
            headers: {
                'Content-Type': `${TABLE_COLUMN_CONTENT_TYPE};charset=UTF-8`,
                Accept: TABLE_COLUMN_CONTENT_TYPE,
            },
        })
        .json();

export const createTableColumn = (id: string, index: number, data: TempIds & { column: (string | null)[] }) =>
    tablesApi
        .post<Table>(`${id}/columns/${index}`, {
            json: data,
            headers: {
                'Content-Type': `${TABLE_COLUMN_CONTENT_TYPE};charset=UTF-8`,
                Accept: TABLE_COLUMN_CONTENT_TYPE,
            },
        })
        .json();

export const deleteTableColumn = (id: string, index: number) =>
    tablesApi
        .delete<Table>(`${id}/columns/${index}`, {
            headers: {
                'Content-Type': `${TABLE_COLUMN_CONTENT_TYPE};charset=UTF-8`,
                Accept: TABLE_COLUMN_CONTENT_TYPE,
            },
        })
        .json();

export const updateRow = (
    id: string,
    index: number,
    data: TempIds & {
        row: { label: string | null; data: (string | null)[] };
    },
) =>
    tablesApi
        .put<Table>(`${id}/rows/${index}`, {
            json: data,
            headers: {
                'Content-Type': `${TABLE_ROW_CONTENT_TYPE};charset=UTF-8`,
                Accept: TABLE_ROW_CONTENT_TYPE,
            },
        })
        .json();

export const createTableRow = (id: string, index: number, data: TempIds & { row: { label: string | null; data: (string | null)[] } }) =>
    tablesApi
        .post<Table>(`${id}/rows/${index}`, {
            json: data,
            headers: { 'Content-Type': `${TABLE_ROW_CONTENT_TYPE};charset=UTF-8`, Accept: TABLE_ROW_CONTENT_TYPE },
        })
        .json();

export const deleteTableRow = (id: string, index: number) =>
    tablesApi
        .delete<Table>(`${id}/rows/${index}`, {
            headers: { 'Content-Type': `${TABLE_ROW_CONTENT_TYPE};charset=UTF-8`, Accept: TABLE_ROW_CONTENT_TYPE },
        })
        .json();
