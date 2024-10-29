import { Statement } from 'services/backend/types';

export type DataBrowserConfig = {
    /**
     * Determines if the DataBrowser is in edit mode.
     */
    isEditMode?: boolean;
    /**
     * An array of resource IDs representing the default history.
     * If not set or an empty array, the history will be taken from the URL.
     */
    defaultHistory?: string[];
    /**
     * Determines if values should be opened in a dialog.
     */
    openValuesInDialog?: boolean;
    /**
     * Determines if properties should be displayed as links.
     * if false the link appears in black font color and opens in a new window
     */
    propertiesAsLinks?: boolean;
    /**
     * Determines if values should be displayed as links.
     */
    valuesAsLinks?: boolean;
    /**
     * Determines if editing is allowed at the shared root level.
     * If false in the paper view and the contribution is used in a comparison (which makes shared property >2),
     * it will prevent edit mode.
     */
    canEditSharedRootLevel?: boolean;
    /**
     * Determines if external descriptions should be shown.
     */
    showExternalDescriptions?: boolean;
    /**
     * Determines if the header should be shown.
     */
    showHeader?: boolean;
    /**
     * An array of class IDs representing the classes to be collapsed.
     */
    collapsedClasses?: string[];
    /**
     * An array of statements representing the statements snapshot.
     */
    statementsSnapshot?: Statement[];
};

export type DataBrowserPreferences = {
    /**
     * If true, data types will be shown inline with the values.
     */
    showInlineDataTypes: boolean;
    /**
     * If true, values will be expanded by default.
     */
    expandValuesByDefault: boolean;
};

/**
 * The context for the DataBrowser is used to pass the research field, title and abstract to the nlp service to get recommendations.
 */
export type DataBrowserResourceContext = {
    /**
     * The research field associated with the paper being browsed.
     */
    researchField?: string;
    /**
     * The title of the paper being browsed.
     */
    title?: string;
    /**
     * The abstract of the paper being browsed.
     */
    abstract?: string;
};

export type DataBrowserProps = {
    /**
     * The ID of the root resource to be browsed (the current resource will be taken from the URL).
     */
    id: string;
} & DataBrowserConfig &
    DataBrowserResourceContext;
