import env from 'components/NextJsMigration/env';

export const url = `${env('NEXT_PUBLIC_BACKEND_URL')}api/`;
export const DEFAULT_COMPARISON_METHOD = 'PATH';
export const DIAGRAM_CONTEXT_MENU_ID = 'diagram-context-menu';
export const LICENSE_URL = 'https://creativecommons.org/publicdomain/zero/1.0/';
export const EXTRACTION_METHODS = {
    UNKNOWN: 'UNKNOWN',
    AUTOMATIC: 'AUTOMATIC',
    MANUAL: 'MANUAL',
};
export const MAX_LENGTH_INPUT = 8164;
