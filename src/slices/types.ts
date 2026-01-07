import type { IHighlight, Position } from 'react-pdf-highlighter';

import { Paper, Resource } from '@/services/backend/types';
import type { AppStore } from '@/store';

export type Range = {
    id: string;
    text: string;
    predicate: {
        id: string;
        label: string;
    };
    start: number;
    end: number;
    isEditing?: boolean;
};

// TODO: not complete yet
export type ViewPaper = {
    isAbstractLoading: boolean;
    isAbstractFailedFetching: boolean;
    fetchAbstractTitle: string | null;
    abstractDialogView: 'input' | 'annotator' | 'list';
    ranges: {
        [key: string]: Range;
    };
    abstract: string;
};

export type TemplateEditor = {
    id: string;
    diagramMode: boolean;
};

export type Annotation = IHighlight & {
    type: string;
    isExtractionModalOpen?: boolean;
    parsedPdfData?: string;
    viewportPosition?: Position;
    view?: 'extraction' | 'validation' | 'done';
    importedPapers?: string[];
    importedContributions?: string[];
    tableId?: string;
    tableLabel?: string;
};

export type PdfAnnotation = {
    annotations: Annotation[];
    pdf?: string;
    scale: number;
    isLoadedPdfViewer: boolean;
    showHighlights: boolean;
    summaryFetched: boolean;
    tableData: Record<string, string[][]>;
    parsedPdfData: string | undefined;
    pageIndex: number;
    tableHistory: Record<string, { undo: string[][][]; redo: string[][][] }>;
};

// TODO: add additional slices here when they are migrated to TypeScript
export type RootStore = {
    viewPaper: ViewPaper;
    templateEditor: TemplateEditor;
    pdfAnnotation: PdfAnnotation;
};

export type AppDispatch = AppStore['store']['dispatch'];
