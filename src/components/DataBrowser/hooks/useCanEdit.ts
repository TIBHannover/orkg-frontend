import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useHistory from '@/components/DataBrowser/hooks/useHistory';

const useCanEdit = () => {
    const { config } = useDataBrowserState();
    const { entity } = useEntity();
    const { history } = useHistory();

    let canEdit = true;

    if (entity && 'shared' in entity && entity.shared > 1 && (history.length > 1 || (history.length <= 1 && !config.canEditSharedRootLevel))) {
        canEdit = false;
    }

    return { canEdit };
};

export default useCanEdit;
