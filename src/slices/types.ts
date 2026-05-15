import type { IHighlight, Position } from 'react-pdf-highlighter';

import { OptionType } from '@/components/Autocomplete/types';
import { ExtractionMethod, PropertyShape } from '@/services/backend/types';
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
    nerProperties: Record<string, { id: string; label: string }>;
};

export type TemplateEditor = {
    id: string;
    diagramMode: boolean;
    isSaving: boolean;
    isLoading: boolean;
    failureStatus: number | null;
    hasFailed: boolean;
    hasFailedSaving?: boolean;
    label: string;
    description: string;
    target_class: OptionType | null;
    relations: {
        research_fields?: OptionType[];
        research_problems?: OptionType[];
    };
    is_closed: boolean;
    hasLabelFormat: boolean;
    formatted_label: string;
    properties: PropertyShape[];
    templateFlow: unknown;
    error: unknown;
    created_by: string | null;
    created_at: string | null;
    extraction_method: ExtractionMethod;
    observatory_id?: string;
    organization_id?: string;
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
