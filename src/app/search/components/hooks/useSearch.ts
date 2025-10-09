import { isEmpty } from 'lodash';
import { useRouter } from 'next/navigation';
import { parseAsInteger, useQueryState } from 'nuqs';
import useSWR from 'swr';

import { getEntityLink } from '@/app/search/components/Item/Item';
import DEFAULT_FILTERS from '@/app/search/components/searchDefaultFilters';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import REGEX from '@/constants/regex';
import { classesUrl, getClassById } from '@/services/backend/classes';
import { getPaperByDoi, papersUrl } from '@/services/backend/papers';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { getThing, getThings, Thing, thingsUrl } from '@/services/backend/things';
import { PaginatedResponse, Statement } from '@/services/backend/types';

export const IGNORED_CLASSES = [CLASSES.CONTRIBUTION_DELETED, CLASSES.PAPER_DELETED, CLASSES.COMPARISON_DRAFT, CLASSES.COMPARISON_DELETED];

type UseSearchProps = {
    defaultFilters?: { label: string; id: string }[];
    ignoredClasses?: string[];
    itemsPerFilter?: number;
    searchAuthor?: boolean;
    redirectToEntity?: boolean;
};

const useSearch = ({
    defaultFilters = DEFAULT_FILTERS,
    ignoredClasses = IGNORED_CLASSES,
    itemsPerFilter = 25,
    searchAuthor = false,
    redirectToEntity = false,
}: UseSearchProps) => {
    const [searchTerm, setSearchTerm] = useQueryState('q', { defaultValue: '' });
    const [createdBy] = useQueryState('createdBy', { defaultValue: '' });
    const [observatoryId] = useQueryState('observatoryId', { defaultValue: '' });
    const [type, setType] = useQueryState('type', { defaultValue: '' });
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0));
    const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(itemsPerFilter));
    const router = useRouter();

    let typeData = defaultFilters.find((f) => f.id === type);
    const { data: _typeData } = useSWR(!typeData ? [type, classesUrl, 'getClassById'] : null, ([params]) => getClassById(params));
    typeData = !typeData ? _typeData : typeData;

    const { data: entity, isLoading: isLoadingEntity } = useSWR(
        searchTerm && searchTerm.startsWith('#') ? [searchTerm.substring(1), getThing, 'getThing'] : null,
        ([params]) => getThing(params),
    );

    if (entity && redirectToEntity) {
        const link = getEntityLink(entity);
        router.push(link);
    }

    const { data: _results, isLoading: isLoadingResults } = useSWR(
        [
            {
                page,
                size: itemsPerFilter,
                q: searchTerm,
                created_by: !isEmpty(createdBy) ? createdBy : undefined,
                observatory_id: !isEmpty(observatoryId) ? observatoryId : undefined,
                exclude: ignoredClasses,
                include: type ? [type] : undefined,
            },
            thingsUrl,
            'getThings',
        ],
        ([params]) => getThings(params) as Promise<PaginatedResponse<Thing>>,
    );

    const { data: _countResults, isLoading: isLoadingCountResults } = useSWR(
        [{ searchTerm, createdBy, observatoryId }, thingsUrl, 'getThings'],
        ([params]) =>
            Promise.all(
                defaultFilters.map((f) => {
                    return getThings({
                        page: 0,
                        size: 1,
                        q: params.searchTerm,
                        include: [f.id],
                        created_by: !isEmpty(params.createdBy) ? params.createdBy : undefined,
                        observatory_id: !isEmpty(params.observatoryId) ? params.observatoryId : undefined,
                    });
                }),
            ),
    );

    const countResults = Object.fromEntries(defaultFilters.map((f, index) => [f.id, _countResults?.[index]])) as Record<
        string,
        PaginatedResponse<Thing>
    >;

    // for papers, try to find a DOI
    const doi = searchTerm.startsWith('http') ? searchTerm.trim().substring(searchTerm.trim().indexOf('10.')) : searchTerm;
    const { data: paper, isLoading: isLoadingPaper } = useSWR(REGEX.DOI_ID.test(doi) ? [doi, papersUrl, 'getPaperByDoi'] : null, ([params]) =>
        getPaperByDoi(params),
    );
    let results = _results;
    if ((paper || entity) && _results) {
        results = {
            ..._results,
            content: [
                ...(paper ? [{ ...paper, label: paper.title, classes: [CLASSES.PAPER], _class: ENTITIES.RESOURCE } as unknown as Thing] : []),
                ...(entity ? [{ ...entity, label: entity.label, classes: [entity._class], _class: entity._class } as unknown as Thing] : []),
                ...(_results?.content || []),
            ],
        };
    }

    // check if the search term is an author
    const { data: authorStatements, isLoading: isLoadingAuthorStatements } = useSWR(
        searchAuthor && type === CLASSES.AUTHOR ? [searchTerm, statementsUrl, 'getStatements'] : null,
        ([params]) =>
            getStatements({ objectLabel: params, predicateId: PREDICATES.HAS_LIST_ELEMENT, size: 1, returnContent: true }) as Promise<Statement[]>,
    );
    const { data: authors, isLoading: isLoadingAuthors } = useSWR(
        !isLoadingAuthorStatements && authorStatements && authorStatements.length > 0
            ? [authorStatements[0].subject.id, statementsUrl, 'getStatements']
            : null,
        ([params]) => getStatements({ objectId: params, returnContent: true }) as Promise<Statement[]>,
    );
    const isAuthorExists = (authors && authors.length > 0 && !!authors.find((s) => s.predicate.id === PREDICATES.HAS_AUTHORS)) ?? false;

    const hasNextPage = !!(results?.page.total_pages && results?.page.total_pages > page + 1);
    return {
        typeData,
        setType,
        type,
        searchTerm,
        page,
        countResults,
        isLoading: isLoadingCountResults || isLoadingResults || isLoadingEntity || isLoadingPaper || isLoadingAuthors,
        pageSize,
        setPageSize,
        setPage,
        results,
        isAuthorExists,
        hasNextPage,
        setSearchTerm,
    };
};
export default useSearch;
