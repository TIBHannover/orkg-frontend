import type { AppStore } from 'store';

export type AuthSliceType = {
    user: null | {
        displayName: string;
        id: string;
        email: string;
        isCurationAllowed: boolean;
        organization_id: string;
        observatory_id: string;
    };
    initialized: boolean;
    authenticated: boolean;
};

// TODO: not complete yet
export type ContributionEditor = {
    isHelpModalOpen: boolean;
    helpCenterArticleId: string;
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
    auth: AuthSliceType;
    contributionEditor: ContributionEditor;
    viewPaper: ViewPaper;
};

export type AppDispatch = AppStore['store']['dispatch'];
