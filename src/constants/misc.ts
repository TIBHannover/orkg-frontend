import { env } from 'next-runtime-env';

import { ExtractionMethod } from '@/services/backend/types';

export const url = `${env('NEXT_PUBLIC_BACKEND_URL')}api/`;
// remove the trailing slash, can be removed when the .env file is updated to remove the trailing slash
export const urlNoTrailingSlash = url.replace(/\/+$/, '');

export const DEFAULT_COMPARISON_METHOD: string = 'PATH';
export const DIAGRAM_CONTEXT_MENU_ID: string = 'diagram-context-menu';
export const LICENSE_URL: string = 'https://creativecommons.org/publicdomain/zero/1.0/';

export const ALL_CONTENT_TYPES_ID = 'All';

export const EXTRACTION_METHODS: {
    [key in ExtractionMethod]: ExtractionMethod;
} = {
    UNKNOWN: 'UNKNOWN',
    AUTOMATIC: 'AUTOMATIC',
    MANUAL: 'MANUAL',
    AI_GENERATED: 'AI_GENERATED',
    AI_GENERATED_WITH_MANUAL_REVIEW: 'AI_GENERATED_WITH_MANUAL_REVIEW',
};

export const EXTRACTION_METHOD_LABELS: {
    [key in ExtractionMethod]: string;
} = {
    UNKNOWN: 'Unknown',
    AUTOMATIC: 'Automatic',
    MANUAL: 'Manual',
    AI_GENERATED: 'AI generated',
    AI_GENERATED_WITH_MANUAL_REVIEW: 'AI with manual review',
};

export const getExtractionMethodLabel = (method: ExtractionMethod): string => EXTRACTION_METHOD_LABELS[method] ?? method;
export const MAX_LENGTH_INPUT: number = 8164;
