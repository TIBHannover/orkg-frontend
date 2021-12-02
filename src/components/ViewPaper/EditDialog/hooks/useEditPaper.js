import { CLASSES, PREDICATES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import { isEqual, cloneDeep } from 'lodash';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createLiteral as createLiteralApi, updateLiteral } from 'services/backend/literals';
import { markAsUnverified, markAsVerified } from 'services/backend/papers';
import { createResource, getResource, updateResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementById,
    deleteStatementsByIds,
    getStatementsByPredicateAndLiteral,
    getStatementsBySubject,
    updateStatement
} from 'services/backend/statements';
import { getIsVerified } from 'services/backend/papers';

const useEditPaper = () => {
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);
    const user = useSelector(state => state.auth.user);

    const editPaper = async ({ paper, month, year, authors, prevAuthors, doi, publishedIn, researchField, url, isVerified }) => {
        // Validate title
        if (!paper.label) {
            toast.error('Please enter the title of this paper');
            return;
        }

        // Validate URL
        if (url.label && !new RegExp(REGEX.URL).test(url.label.trim())) {
            toast.error(`Please enter a valid paper URL`);
            return;
        }

        setIsLoadingEdit(true);

        const updatedData = {
            paper,
            publishedIn,
            researchField
        };

        // title
        updateResource(paper.id, paper.label);

        // authors
        const authorsUpdated = await updateAuthors({ authors, prevAuthors, paperId: paper.id }); //use await to prevent updating the props, which are needed to check whether authors exist
        updatedData.authors = authorsUpdated;

        if (publishedIn?.statementId && publishedIn?.id) {
            // update venue
            await updateStatement(publishedIn.statementId, { object_id: publishedIn.id });
        } else if (publishedIn?.id && !publishedIn?.statementId) {
            // add venue
            await createResourceStatement(paper.id, PREDICATES.HAS_VENUE, publishedIn.id);
        } else if (publishedIn?.statementId && !publishedIn?.id) {
            // delete venue
            await deleteStatementById(publishedIn.statementId);
            // this.setState({ publishedIn: '' });
            updatedData.publishedIn = '';
        }

        // research field
        if (researchField && researchField.statementId && researchField.id) {
            await updateStatement(researchField.statementId, { object_id: researchField.id });
        } else if (researchField && !researchField.statementId && researchField.id) {
            const statement = await createResourceStatement(paper.id, PREDICATES.HAS_RESEARCH_FIELD, researchField.id);
            updatedData.researchField = { ...researchField, statementId: statement.id };
        }

        // update literals
        updatedData.month = await updateOrCreateLiteral({
            id: month?.id,
            label: month.label,
            predicateId: PREDICATES.HAS_PUBLICATION_MONTH,
            paperId: paper.id
        });

        updatedData.year = await updateOrCreateLiteral({
            id: year?.id,
            label: year.label,
            predicateId: PREDICATES.HAS_PUBLICATION_YEAR,
            paperId: paper.id
        });

        updatedData.doi = await updateOrCreateLiteral({
            id: doi?.id,
            label: doi.label,
            predicateId: PREDICATES.HAS_DOI,
            paperId: paper.id
        });

        updatedData.url = await updateOrCreateLiteral({
            id: url?.id,
            label: url.label,
            predicateId: PREDICATES.URL,
            paperId: paper.id
        });

        updatedData.isVerified = isVerified;
        if (!!user && user.isCurationAllowed) {
            if (isVerified) {
                markAsVerified(paper.id, isVerified).catch(() => {});
            } else {
                markAsUnverified(paper.id, isVerified).catch(() => {});
            }
        }

        setIsLoadingEdit(false);
        return updatedData;
    };

    const loadPaperData = async id => {
        const paper = await getResource(id);
        const paperStatements = await getStatementsBySubject({ id });
        const isVerified = await getIsVerified(id);

        const data = {
            paper,
            authors: [],
            isVerified
        };

        const propertyIdToKey = {
            [PREDICATES.HAS_PUBLICATION_MONTH]: 'month',
            [PREDICATES.HAS_PUBLICATION_YEAR]: 'year',
            [PREDICATES.HAS_DOI]: 'doi',
            [PREDICATES.HAS_VENUE]: 'publishedIn',
            [PREDICATES.HAS_RESEARCH_FIELD]: 'researchField',
            [PREDICATES.URL]: 'url'
        };

        for (const { predicate: property, object, id: statementId } of paperStatements) {
            if (property.id in propertyIdToKey) {
                data[propertyIdToKey[property.id]] = {
                    ...object,
                    statementId: property.id === PREDICATES.HAS_RESEARCH_FIELD || property.id === PREDICATES.HAS_VENUE ? statementId : undefined
                };
            }
            if (property.id === PREDICATES.HAS_AUTHOR) {
                data.authors.push({
                    ...object,
                    statementId
                });
            }
        }
        data.authors.reverse();
        return data;
    };

    const updateOrCreateLiteral = async ({ id = null, label, predicateId, paperId }) => {
        if (id) {
            updateLiteral(id, label);
            return {
                id,
                label
            };
        } else if (label) {
            const newLiteral = await createLiteralApi(label);
            createLiteralStatement(paperId, predicateId, newLiteral.id);
            return {
                id: newLiteral.id,
                label
            };
        }
        return null;
    };

    const updateAuthors = async ({ prevAuthors, authors, paperId }) => {
        // Check if there is changes on the authors
        if (isEqual(prevAuthors, authors)) {
            return authors;
        }
        setIsLoadingAuthors(true);

        const statementsIds = [];
        // remove all authors statement from reducer
        for (const author of prevAuthors) {
            statementsIds.push(author.statementId);
        }
        deleteStatementsByIds(statementsIds);

        // Add all authors from the state
        const authorsUpdated = cloneDeep([...authors]);
        for (const [i, author] of authorsUpdated.entries()) {
            // create the author
            if (author.orcid) {
                // Create author with ORCID
                // check if there's an author resource
                const responseJson = await getStatementsByPredicateAndLiteral({
                    predicateId: PREDICATES.HAS_ORCID,
                    literal: author.orcid,
                    subjectClass: CLASSES.AUTHOR,
                    items: 1
                });
                if (responseJson.length > 0) {
                    // Author resource exists
                    const authorResource = responseJson[0];
                    const authorStatement = await createResourceStatement(paperId, PREDICATES.HAS_AUTHOR, authorResource.subject.id);
                    authorsUpdated[i].statementId = authorStatement.id;
                    authorsUpdated[i].id = authorResource.subject.id;
                    authorsUpdated[i].class = authorResource.subject._class;
                    authorsUpdated[i].classes = authorResource.subject.classes;
                } else {
                    // Author resource doesn't exist
                    // Create resource author
                    const authorResource = await createResource(author.label, [CLASSES.AUTHOR]);
                    const createLiteral = await createLiteralApi(author.orcid);
                    await createLiteralStatement(authorResource.id, PREDICATES.HAS_ORCID, createLiteral.id);
                    const authorStatement = await createResourceStatement(paperId, PREDICATES.HAS_AUTHOR, authorResource.id);
                    authorsUpdated[i].statementId = authorStatement.id;
                    authorsUpdated[i].id = authorResource.id;
                    authorsUpdated[i].class = authorResource._class;
                    authorsUpdated[i].classes = authorResource.classes;
                }
            } else {
                // Author resource exists
                if (author.label !== author.id) {
                    const authorStatement = await createResourceStatement(paperId, PREDICATES.HAS_AUTHOR, author.id);
                    authorsUpdated[i].statementId = authorStatement.id;
                    authorsUpdated[i].id = author.id;
                    authorsUpdated[i].class = author._class;
                    authorsUpdated[i].classes = author.classes;
                } else {
                    // Author resource doesn't exist
                    const newLiteral = await createLiteralApi(author.label);
                    // Create literal of author
                    const authorStatement = await createLiteralStatement(paperId, PREDICATES.HAS_AUTHOR, newLiteral.id);
                    authorsUpdated[i].statementId = authorStatement.id;
                    authorsUpdated[i].id = newLiteral.id;
                    authorsUpdated[i].class = authorStatement.object._class;
                    authorsUpdated[i].classes = authorStatement.object.classes;
                }
            }
        }
        setIsLoadingAuthors(false);

        return authorsUpdated;
    };

    return { editPaper, updateAuthors, loadPaperData, isLoadingEdit, isLoadingAuthors };
};

export default useEditPaper;
