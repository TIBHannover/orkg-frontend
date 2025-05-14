import { Paper } from '@/services/backend/types';
import type { AppStore } from '@/store';

// TODO: not complete yet
export type ContributionEditor = {
    contributions: any;
    statements: any;
    resources: any;
    literals: any;
    properties: any;
    papers: any;
    templates: any;
    classes: any;
    isLoading: boolean;
    hasFailed: boolean;
    previousInputDataType: string;
    isHelpModalOpen: boolean;
    helpCenterArticleId: string;
    isTemplatesModalOpen: boolean;
    currentSementifyCell: string[];
};

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
    paper: Paper;
    isAbstractLoading: boolean;
    isAbstractFailedFetching: boolean;
    fetchAbstractTitle: string | null;
    abstractDialogView: 'input' | 'annotator' | 'list';
    ranges: {
        [key: string]: Range;
    };
    abstract: string;
};

// TODO: add additional slices here when they are migrated to TypeScript
export type RootStore = {
    contributionEditor: ContributionEditor;
    viewPaper: ViewPaper;
};

export type AppDispatch = AppStore['store']['dispatch'];
