import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';

const useSnapshotStatement = () => {
    const { config } = useDataBrowserState();
    return { isUsingSnapshot: config.statementsSnapshot !== undefined && config.statementsSnapshot.length > 0 };
};
export default useSnapshotStatement;
