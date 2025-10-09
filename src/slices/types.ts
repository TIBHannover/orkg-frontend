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

// TODO: add additional slices here when they are migrated to TypeScript
export type RootStore = {
    viewPaper: ViewPaper;
    templateEditor: TemplateEditor;
};

export type AppDispatch = AppStore['store']['dispatch'];
