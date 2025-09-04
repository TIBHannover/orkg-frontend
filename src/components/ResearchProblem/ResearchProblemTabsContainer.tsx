import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import { CLASSES } from '@/constants/graphSettings';
import { getPaper, getPapersLinkedToResource, papersUrl } from '@/services/backend/papers';
import { PaginatedResponse, PaginationParams, Paper, Resource } from '@/services/backend/types';

export const RESEARCH_PROBLEM_CONTENT_TABS = [
    { id: CLASSES.PAPER, label: 'Papers' },
    // { id: CLASSES.COMPARISON, label: 'Comparisons' },
    // { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    // { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    // { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
];

function ResearchProblemTabsContainer({ id }: { id: string }) {
    const renderListItem = (object: Paper & { path: Resource[][] }) => {
        return <PaperCard paper={object} key={object.id} />;
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
        <ListPage
            label="papers"
            boxShadow
            renderListItem={renderListItem}
            // @ts-ignore
            fetchFunction={fetchItems}
            fetchUrl={papersUrl}
            fetchExtraParams={{ id, returnContent: false }}
            disableSearch
            defaultSortBy="paper.created_at"
            flush
        />
    );
}

export default ResearchProblemTabsContainer;
