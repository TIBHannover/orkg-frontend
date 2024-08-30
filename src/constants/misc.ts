'use client';

import { env } from 'next-runtime-env';
import { ExtractionMethod } from 'services/backend/types';

export const url: string = `${env('NEXT_PUBLIC_BACKEND_URL')}api/`;
export const DEFAULT_COMPARISON_METHOD: string = 'PATH';
export const DIAGRAM_CONTEXT_MENU_ID: string = 'diagram-context-menu';
export const LICENSE_URL: string = 'https://creativecommons.org/publicdomain/zero/1.0/';

export const EXTRACTION_METHODS: {
    [key in ExtractionMethod]: ExtractionMethod;
} = {
    UNKNOWN: 'UNKNOWN',
    AUTOMATIC: 'AUTOMATIC',
    MANUAL: 'MANUAL',
};
export const MAX_LENGTH_INPUT: number = 8164;
