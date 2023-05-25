import { createResourceStatement, getStatementsByPredicateAndLiteral, deleteStatementsByIds } from 'services/backend/statements';
import { isEqual } from 'lodash';
import { createLiteral } from 'services/backend/literals';
import { createObject } from 'services/backend/misc';
import { PREDICATES, CLASSES } from 'constants/graphSettings';

/**
 * Save the authors of a resource
 *  1. Search authors by ORCID and return the resource object
 *  2. For new ORCID create an Author resource and return resource object
 *  3. Create the new Literals (are identified by __isNew__ property)
 *  4. Create author statements
 * @param {*} _authors the authors coming from AuthorInput component
 * @param {*} resourceId the resource id
 * @returns list of authors
 */
export const saveAuthors = async (_authors, resourceId) => {
    let authors = _authors;
    // Search authors by ORCID
    authors = await Promise.all(
        authors.map(author => {
            if (author.orcid) {
                return getStatementsByPredicateAndLiteral({
                    predicateId: PREDICATES.HAS_ORCID,
                    literal: author.orcid,
                    subjectClass: CLASSES.AUTHOR,
                    items: 1,
                }).then(s => (s.length > 0 ? Promise.resolve(s.object) : Promise.resolve(author)));
            }
            return Promise.resolve(author);
        }),
    );
    // Create authors for the new ORCID
    authors = await await Promise.all(
        authors.map(author => {
            if (author.orcid) {
                return createObject({
                    predicates: [],
                    resource: {
                        name: author.label,
                        classes: [CLASSES.AUTHOR],
                        values: {
                            [PREDICATES.HAS_ORCID]: [
                                {
                                    text: author.orcid,
                                },
                            ],
                        },
                    },
                });
            }
            return Promise.resolve(author);
        }),
    );
    // Create the new literals for authors
    authors = await Promise.all(
        authors.map(author => {
            if (!author.orcid) {
                return createLiteral(author.label);
            }
            return Promise.resolve(author);
        }),
    );
    // Create author statements (the order is imported so we have to wait for each request to finish to the sent the next)
    const authorsList = [];
    for (const author of authors) {
        // eslint-disable-next-line no-await-in-loop
        const s = await createResourceStatement(resourceId, PREDICATES.HAS_AUTHOR, author.id);
        authorsList.push({ ...s.object, statementId: s.id, s_created_at: s.created_at });
    }
    return authorsList;
};

export async function updateAuthors({ prevAuthors, newAuthors, resourceId }) {
    // Check if there is changes on the authors
    if (isEqual(prevAuthors, newAuthors)) {
        return prevAuthors;
    }

    const statementsIds = [];
    // remove all authors statement from reducer
    // literals will be also delete if they are not linked to any statements
    for (const author of prevAuthors) {
        statementsIds.push(author.statementId);
    }
    deleteStatementsByIds(statementsIds);
    const authorsUpdated = await saveAuthors(newAuthors, resourceId);

    return authorsUpdated;
}
