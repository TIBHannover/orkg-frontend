'use client';

import env from 'components/NextJsMigration/env';

export const url = `${env('BACKEND_URL')}api/`;
export const DEFAULT_COMPARISON_METHOD = 'path';
export const DIAGRAM_CONTEXT_MENU_ID = 'diagram-context-menu';
