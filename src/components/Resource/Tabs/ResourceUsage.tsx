import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import { getPaper, getPapersLinkedToResource, papersUrl } from '@/services/backend/papers';
import { PaginatedResponse, PaginationParams, Paper, Resource } from '@/services/backend/types';

function ResourceUsage({ id }: { id: string }) {
    const renderListItem = (object: Paper & { path: Resource[][] }) => {
        return <PaperCard paper={object} paths={object.path} key={object.id} />;
    };

    const fetchItems = async (
        params: {
            id: string;
            returnContent?: boolean;
        } & PaginationParams,
    ) => {
        const result = await getPapersLinkedToResource(params);
        const papers = await Promise.all((result as PaginatedResponse<Resource & { path: Resource[][] }>).content.map((p) => getPaper(p.id)));
        return {
            ...result,
            content: papers.map((p) => ({
                ...p,
                path: (result as PaginatedResponse<Resource & { path: Resource[][] }>).content.find((rp) => rp.id === p.id)?.path,
            })),
        };
    };

    return (
        <div>
            <ListPage
                label="papers"
                boxShadow={false}
                hideTitleBar
                renderListItem={renderListItem}
                // @ts-ignore
                fetchFunction={fetchItems}
                fetchUrl={papersUrl}
                fetchExtraParams={{ id, returnContent: false }}
                disableSearch
                defaultSortBy="paper.created_at"
                flush
            />
        </div>
    );
}

export default ResourceUsage;
