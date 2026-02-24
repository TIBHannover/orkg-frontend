import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';

const NoData = () => {
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const { canEdit } = useCanEdit();
    return (
        <ListGroupItem className="p-3 mb-0 rounded">
            No data yet
            <div>
                {isEditMode && canEdit ? (
                    <small>Start by using a template or adding property from below</small>
                ) : (
                    <small>Please contribute by editing</small>
                )}
            </div>
        </ListGroupItem>
    );
};

export default NoData;
