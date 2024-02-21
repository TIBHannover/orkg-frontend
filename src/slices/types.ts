export type AuthSliceType = {
    dialogIsOpen: boolean;
    action: string;
    user: null | 0 | { displayName: string; id: string; token: string; tokenExpire: string; email: string; isCurationAllowed: boolean };
    signInRequired: null | string;
    redirectRoute: null | string;
};

// TODO: add additional slices here when they are migrated to TypeScript
export type RootStore = {
    auth: AuthSliceType;
};
