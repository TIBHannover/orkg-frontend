import { FC } from 'react';

import Body from '@/components/DataBrowser/components/Body/Body';
import Footer from '@/components/DataBrowser/components/Footer/Footer';
import Header from '@/components/DataBrowser/components/Header/Header';
import DataBrowserProvider from '@/components/DataBrowser/context/DataBrowserContext';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { CLASSES } from '@/constants/graphSettings';

const DataBrowser: FC<DataBrowserProps> = ({
    id,
    isEditMode = false,
    defaultHistory = [], // if not set or empty array, the history will be from the url
    openValuesInDialog = false,
    propertiesAsLinks = false,
    valuesAsLinks = false,
    canEditSharedRootLevel = false,
    showExternalDescriptions = true,
    showHeader = true,
    showFooter = true,
    collapsedClasses = ['', CLASSES.RESEARCH_FIELD, CLASSES.PAPER, CLASSES.CONTRIBUTION, CLASSES.CSVW_TABLE, CLASSES.CSVW_ROW, CLASSES.CSVW_COLUMN],
    researchField,
    title,
    abstract,
    statementsSnapshot,
    snapshotCreatedAt,
    comparisonSelectedPaths,
}) => {
    const config = {
        isEditMode,
        defaultHistory,
        openValuesInDialog,
        propertiesAsLinks,
        valuesAsLinks,
        canEditSharedRootLevel,
        showExternalDescriptions,
        showHeader,
        collapsedClasses,
        statementsSnapshot,
        snapshotCreatedAt,
        showFooter,
        comparisonSelectedPaths,
    };
    const context = { researchField, title, abstract, snapshotCreatedAt };
    return (
        <ErrorBoundary fallback="Something went wrong while loading the data browser!">
            <DataBrowserProvider rootId={id} config={config} context={context}>
                <div className="bg-surface border border-border rounded-md overflow-hidden mb-2">
                    {showHeader && <Header />}
                    <Body />
                </div>
                {showFooter && <Footer />}
            </DataBrowserProvider>
        </ErrorBoundary>
    );
};

export default DataBrowser;
