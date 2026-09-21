import { Alert } from '@heroui/react';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import { getLinkedPapersWithPaths, pathsUrl } from '@/services/backend/paths';
import { Thing } from '@/services/backend/things';
import { Paper } from '@/services/backend/types';

function ResourceUsage({ id }: { id: string }) {
    const renderListItem = (object: Paper & { path?: Thing[][] }) => {
        return <PaperCard paper={object} paths={object.path} key={object.id} />;
    };

    return (
        <div>
            <Alert className="mb-2" status="accent">
                <Alert.Indicator />
                <Alert.Content className="min-w-0 flex-1">
                    <Alert.Title>Note</Alert.Title>
                    <Alert.Description>This tab shows papers that reference this resource.</Alert.Description>
                </Alert.Content>
            </Alert>
            <ListPage
                label="papers"
                boxShadow={false}
                hideTitleBar
                renderListItem={renderListItem}
                fetchFunction={getLinkedPapersWithPaths}
                fetchFunctionName="getLinkedPapersWithPaths"
                fetchUrl={pathsUrl}
                fetchExtraParams={{ id }}
                disableSearch
                flush
            />
        </div>
    );
}

export default ResourceUsage;
