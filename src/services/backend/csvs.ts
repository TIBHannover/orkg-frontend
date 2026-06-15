import { CSVsApi } from '@orkg/orkg-client';

import { configuration, getCreatedId } from '@/services/backend/backendApi';

const csvsApi = new CSVsApi(configuration);

export const createCsv = ({ file, format = 'EXCEL_SEMICOLON_DELIMITED', type = 'PAPER' }: { file: string; format?: string; type?: string }) =>
    csvsApi.createRaw({ file: new Blob([file], { type: 'text/csv' }), format, type }).then(getCreatedId);

export const startCsvValidation = (id: string) => csvsApi.startValidationById({ id });

export const getCsvValidationStatus = (id: string) => csvsApi.findValidationStatusById({ id });

export const getCsvValidationResults = (id: string) => csvsApi.findValidationResultsById({ id });

export const startCsvImport = (id: string) => csvsApi.startImportById({ id });

export const getCsvImportStatus = (id: string) => csvsApi.findImportStatusById({ id });

export const getCsvImportResults = (id: string) => csvsApi.findImportResultsById({ id });
