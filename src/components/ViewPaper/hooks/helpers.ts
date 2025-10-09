import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { Literal, Paper, Resource, Statement } from '@/services/backend/types';
import { filterObjectOfStatementsByPredicateAndClass, getAuthorsInList } from '@/utils';

export const getPaperContentType = (paperResource: Resource, paperStatements: Statement[]): Paper & { hasVersion: string } => {
    const paperStatementsFirstLevel = paperStatements.filter((s) => s.subject.id === paperResource.id);
    const authors = getAuthorsInList({ resourceId: paperResource.id, statements: paperStatements });
    const contributions = filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_CONTRIBUTION, false, undefined);
    const doi = filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_DOI, false);
    return {
        id: paperResource.id,
        visibility: 'DEFAULT',
        unlisted_by: '',
        sdgs: [],
        mentionings: [],
        title: paperResource.label,
        created_at: paperResource.created_at,
        created_by: paperResource.created_by,
        verified: paperResource.verified,
        observatories: [paperResource.observatory_id],
        organizations: [paperResource.organization_id],
        extraction_method: paperResource.extraction_method,
        observatory_id: paperResource.observatory_id,
        authors: authors.map((author) => ({
            id: author.id,
            name: author.label,
            identifiers: {
                orcid: author.orcid ? [author.orcid] : [],
            },
        })),
        // sort contributions ascending, so contribution 1, is actually the first one
        contributions: contributions.sort((a: Resource, b: Resource) => a.label.localeCompare(b.label)),
        publication_info: {
            published_month:
                filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_PUBLICATION_MONTH, true)?.label ?? null,
            published_year:
                filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_PUBLICATION_YEAR, true)?.label ?? null,
            published_in: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_VENUE, true)?.label ?? null,
            url: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.URL, true)?.label ?? null,
        },
        identifiers: {
            doi: doi.map((d: Literal) => d.label),
        },
        research_fields: filterObjectOfStatementsByPredicateAndClass(
            paperStatementsFirstLevel,
            PREDICATES.HAS_RESEARCH_FIELD,
            true,
            CLASSES.RESEARCH_FIELD,
        ),
        hasVersion: filterObjectOfStatementsByPredicateAndClass(paperStatementsFirstLevel, PREDICATES.HAS_PREVIOUS_VERSION, true),
    };
};

export default getPaperContentType;
