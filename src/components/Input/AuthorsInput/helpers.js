import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import { isEqual } from 'lodash';
import { createList, updateList } from 'services/backend/lists';
import { createLiteral } from 'services/backend/literals';
import { createObject } from 'services/backend/misc';
import { createResourceStatement, getStatementsByPredicateAndLiteral } from 'services/backend/statements';

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

const prepareNewAuthors = async newAuthors => {
    let authors = [...newAuthors];
    // Search authors by ORCID
    authors = await Promise.all(
        authors.map(async author => {
            if (author.orcid) {
                const s = await getStatementsByPredicateAndLiteral({
                    predicateId: PREDICATES.HAS_ORCID,
                    literal: author.orcid,
                    subjectClass: CLASSES.AUTHOR,
                    size: 1,
                });
                return s.length > 0 ? { ...s[0].subject, orcid: author.orcid } : author;
            }
            return author;
        }),
    );
    // Create authors for the new ORCID
    authors = await Promise.all(
        authors.map(async author => {
            if (author.orcid && author._class !== ENTITIES.RESOURCE) {
                const newAuthor = await createObject({
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
                return {
                    orcid: author.orcid,
                    ...newAuthor,
                };
            }
            return Promise.resolve(author);
        }),
    );
    // Create the new literals for authors
    authors = await Promise.all(
        authors.map(author => {
            if (!author.orcid && author._class !== ENTITIES.RESOURCE) {
                return createLiteral(author.label);
            }
            return Promise.resolve(author);
        }),
    );
    return authors;
};

export const updateAuthorsList = async ({ prevAuthors, newAuthors, listId }) => {
    // Check if there is changes on the authors
    if (isEqual(prevAuthors, newAuthors)) {
        return prevAuthors;
    }

    const authors = await prepareNewAuthors(newAuthors);
    await updateList({ id: listId, elements: authors.map(author => author.id) });
    return authors;
};

export const createAuthorsList = async ({ resourceId, authors }) => {
    const preparedAuthors = await prepareNewAuthors(authors);
    const list = await createList({ label: 'authors', elements: preparedAuthors.map(author => author.id) });
    await createResourceStatement(resourceId, PREDICATES.HAS_AUTHORS, list.id);
    return {
        authors: preparedAuthors,
        list,
    };
};
