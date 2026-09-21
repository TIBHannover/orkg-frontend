import {
    CreateTableRequest,
    CreateTableRowRequest,
    TableColumnRequest,
    TableRepresentation,
    TablesApi,
    ThingReferenceRepresentation,
    UpdateTableRequest,
    UpdateTableRowRequest,
} from '@orkg/orkg-client';

import { urlNoTrailingSlash } from '@/constants/misc';
import { configuration, getCreatedId } from '@/services/backend/backendApi';

export const tablesUrl = `${urlNoTrailingSlash}/tables`;

// The row and column deletes carry no body, so the spec declares no request media type and the
// generated operations send no Content-Type — but the endpoints answer 415 without one. (The
// error text points at the Accept header; Content-Type is what it actually wants.) Every
// body-carrying operation already gets its media type from the spec.
const TABLE_ROW_MEDIA_TYPE = 'application/vnd.orkg.table.row.v1+json';
const TABLE_COLUMN_MEDIA_TYPE = 'application/vnd.orkg.table.column.v1+json';

const tablesApi = new TablesApi(configuration);

export type TableCell = ThingReferenceRepresentation | null;

export type Table = TableRepresentation;

export type CreateTableParams = CreateTableRequest;

type UpdateTableParams = UpdateTableRequest;

export const getTable = (id: string) => tablesApi.findById({ id });

export const createTable = (data: CreateTableParams): Promise<string> => tablesApi.createRaw({ createTableRequest: data }).then(getCreatedId);

export const updateTable = (id: string, data: UpdateTableParams) => tablesApi.update({ id, updateTableRequest: data });

export const updateCell = (id: string, row: number, column: number, cellId: string | null) =>
    tablesApi.updateCell({ id, row: row.toString(), column: column.toString(), updateTableCellRequest: { id: cellId ?? undefined } });

export const updateTableColumn = (id: string, index: number, data: TableColumnRequest) =>
    tablesApi.updateColumn({ id, index, tableColumnRequest: data });

export const createTableColumn = (id: string, index: number, data: TableColumnRequest) =>
    tablesApi.createColumnAtIndex({ id, index, tableColumnRequest: data });

export const deleteTableColumn = (id: string, index: number) => tablesApi.deleteColumn({ id, index, contentType: TABLE_COLUMN_MEDIA_TYPE });

export const updateRow = (id: string, index: number, data: UpdateTableRowRequest) => tablesApi.updateRow({ id, index, updateTableRowRequest: data });

export const createTableRow = (id: string, index: number, data: CreateTableRowRequest) =>
    tablesApi.createRowAtIndex({ id, index, createTableRowRequest: data });

export const deleteTableRow = (id: string, index: number) => tablesApi.deleteRow({ id, index, contentType: TABLE_ROW_MEDIA_TYPE });
