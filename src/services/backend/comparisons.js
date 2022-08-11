import { flatten, uniqBy } from 'lodash';
import { filterObjectOfStatementsByPredicateAndClass, filterSubjectOfStatementsByPredicateAndClass } from 'utils';
import { getStatementsByObjectAndPredicate, getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { getResource } from 'services/backend/resources';

/**
 * Get all versions related to a comparison
 * It starts from the comparison node and parse the graph using the predicate HAS_PREVIOUS_VERSION until there is no previous or next versions
 * It assumes that a comparison can have only one previous versions and could have multiple next version
 * It order the version using the creation time (created_at)
 *
 * @param {Array} comparisonId comparison id
 * @return {Array} List of versions (comparisons resources)
 */
export const getComparisonVersionsById = comparisonId => {
    const getVersions = (id, versions = [], checked = []) => {
        if (!id) {
            return Promise.resolve(versions);
        }
        if (checked.includes(id)) {
            return Promise.resolve(versions);
        }
        const next = getStatementsByObjectAndPredicate({ objectId: id, predicateId: PREDICATES.HAS_PREVIOUS_VERSION });
        const previous = getStatementsBySubjectAndPredicate({ subjectId: id, predicateId: PREDICATES.HAS_PREVIOUS_VERSION });
        return Promise.all([next, previous]).then(([nextStatement, previousStatement]) => {
            const nextVersions = filterSubjectOfStatementsByPredicateAndClass(
                nextStatement,
                PREDICATES.HAS_PREVIOUS_VERSION,
                false,
                CLASSES.COMPARISON,
            );
            const previousVersion = filterObjectOfStatementsByPredicateAndClass(
                previousStatement,
                PREDICATES.HAS_PREVIOUS_VERSION,
                true,
                CLASSES.COMPARISON,
            );
            // Push the current version to checked
            checked.push(id);
            if (previousVersion && !versions.find(v => v.id === previousVersion.id)) {
                versions.push(previousVersion);
            }
            nextVersions.forEach(nextVersion => {
                if (nextVersion && !versions.find(v => v.id === nextVersion.id)) {
                    versions.push(nextVersion);
                }
            });
            return Promise.all([
                getVersions(previousVersion?.id, versions, checked),
                ...nextVersions.map(nextVersion => getVersions(nextVersion?.id, versions, checked)),
            ]).then(v => uniqBy(flatten(v), 'id'));
        });
    };
    if (comparisonId) {
        const currentNode = getResource(comparisonId);
        const restOfNodes = getVersions(comparisonId, []);

        return Promise.all([currentNode, restOfNodes]).then(c =>
            uniqBy(flatten(c), 'id').sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        );
    }
    return Promise.resolve([]);
};
