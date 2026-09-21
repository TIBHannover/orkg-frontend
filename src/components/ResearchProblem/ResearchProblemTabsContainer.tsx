import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import { CLASSES } from '@/constants/graphSettings';
import { getLinkedPapersWithPaths, pathsUrl } from '@/services/backend/paths';
import { Paper } from '@/services/backend/types';

// A paper states its research problem on a contribution: paper -> contribution -> problem, two
// hops exactly. A third hop adds no real match, but where a resource is both Problem and
// ResearchField it reaches papers via the field hierarchy — R100 goes from 3 papers to 45.
const MAX_HOPS = 2;

export const RESEARCH_PROBLEM_CONTENT_TABS = [
    { id: CLASSES.PAPER, label: 'Papers' },
    // { id: CLASSES.COMPARISON, label: 'Comparisons' },
    // { id: CLASSES.VISUALIZATION, label: 'Visualizations' },
    // { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Reviews' },
    // { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Lists' },
];

function ResearchProblemTabsContainer({ id }: { id: string }) {
    // no breadcrumb here: every path is the same paper -> contribution -> problem shape, so it
    // would repeat the same three crumbs on every card. Resource usage varies, and shows them.
    const renderListItem = (object: Paper) => {
        return <PaperCard paper={object} key={object.id} />;
    };

    return (
        <ListPage
            label="papers"
            boxShadow
            renderListItem={renderListItem}
            fetchFunction={getLinkedPapersWithPaths}
            fetchFunctionName="getLinkedPapersWithPaths"
            fetchUrl={pathsUrl}
            fetchExtraParams={{ id, maxHops: MAX_HOPS }}
            disableSearch
            flush
        />
    );
}

export default ResearchProblemTabsContainer;
