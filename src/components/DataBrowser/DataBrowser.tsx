import { FC } from 'react';
import styled from 'styled-components';

import Body from '@/components/DataBrowser/components/Body/Body';
import EditorHelpModal from '@/components/DataBrowser/components/EditorHelpModal/EditorHelpModal';
import Footer from '@/components/DataBrowser/components/Footer/Footer';
import Header from '@/components/DataBrowser/components/Header/Header';
import DataBrowserProvider from '@/components/DataBrowser/context/DataBrowserContext';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { CLASSES } from '@/constants/graphSettings';

const DataBrowserContentStyled = styled.div`
    background: ${(props) => props.theme.lightLighter};
    border: 1px solid ${(props) => props.theme.lightDarker};
    border-radius: ${(props) => props.theme.borderRadius};

    .br-bottom {
        border-bottom: 1px solid ${(props) => props.theme.lightDarker};
    }
`;

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
    collapsedClasses = ['', CLASSES.RESEARCH_FIELD, CLASSES.PAPER, CLASSES.CONTRIBUTION, CLASSES.CSVW_TABLE, CLASSES.CSVW_ROW, CLASSES.CSVW_COLUMN],
    researchField,
    title,
    abstract,
    statementsSnapshot,
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
    };
    const context = { researchField, title, abstract };
    return (
        <ErrorBoundary fallback="Something went wrong while loading the data browser!">
            <DataBrowserProvider rootId={id} config={config} context={context}>
                <DataBrowserContentStyled className="mb-2">
                    {showHeader && <Header />}
                    <Body />
                </DataBrowserContentStyled>
                <Footer />
                <EditorHelpModal />
            </DataBrowserProvider>
        </ErrorBoundary>
    );
};

export default DataBrowser;
