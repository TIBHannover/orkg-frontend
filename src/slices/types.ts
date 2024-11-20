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

// TODO: add additional slices here when they are migrated to TypeScript
export type RootStore = {
    auth: AuthSliceType;
    contributionEditor: ContributionEditor;
};

export type AppDispatch = AppStore['store']['dispatch'];
