import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import { ListGroupItem } from 'reactstrap';

const NoData = () => {
    const { config } = useDataBrowserState();
    const { isEditMode } = config;

    return (
        <ListGroupItem className="p-3 mb-0 rounded">
            No data yet
            <div>
                {isEditMode ? <small>Start by using a template or adding property from below</small> : <small>Please contribute by editing</small>}
            </div>
        </ListGroupItem>
    );
};

export default NoData;
