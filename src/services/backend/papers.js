import { url } from 'constants/misc';
import { submitPutRequest, submitDeleteRequest, submitPostRequest, submitGetRequest } from 'network';
import { getStatementsBySubjectAndPredicate, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { indexContribution } from 'services/similarity';
import { toast } from 'react-toastify';

export const papersUrl = `${url}papers/`;

// Save full paper and index contributions in the similarity service
export const saveFullPaper = (data, mergeIfExists = false) =>
    submitPostRequest(`${papersUrl}?mergeIfExists=${mergeIfExists}`, { 'Content-Type': 'application/json' }, data).then(async paper => {
        Promise.all(await indexContributionsByPaperId(paper.id)).catch(() =>
            toast.warning('Similarity service seems to be down, skipping paper indexing'),
        );
        return paper;
    });

export const getIsVerified = id => submitGetRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const markAsVerified = id => submitPutRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const markAsUnverified = id => submitDeleteRequest(`${papersUrl}${id}/metadata/verified`, { 'Content-Type': 'application/json' });

export const indexContributionsByPaperId = async paperId => {
    const contributionStatements = await getStatementsBySubjectAndPredicate({
        subjectId: paperId,
        predicateId: PREDICATES.HAS_CONTRIBUTION,
    });

    return contributionStatements.map(statement => indexContribution(statement.object.id));
};

export const getOriginalPaperId = paperId => {
    const getPaperId = async id => {
        const statement = await getStatementsByObjectAndPredicate({
            objectId: id,
            predicateId: PREDICATES.HAS_PREVIOUS_VERSION,
        });
        if (statement[0].subject.classes.find(s => s === CLASSES.HAS_PREVIOUS_VERSION)) {
            getPaperId(statement[0].subject.id);
        }
        return statement[0].subject.id;
    };
    const pId = getPaperId(paperId);
    return pId;
};
