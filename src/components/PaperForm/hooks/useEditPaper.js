import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PREDICATES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import { useSelector } from 'react-redux';
import { createLiteral as createLiteralApi, updateLiteral } from 'services/backend/literals';
import { markAsUnverified, markAsVerified, getIsVerified } from 'services/backend/papers';
import { getResource, updateResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementById,
    getStatementsBySubject,
    updateStatement,
} from 'services/backend/statements';
import { updateAuthorsList } from 'components/Input/AuthorsInput/helpers';

const useEditPaper = ({ paperData, afterUpdate }) => {
    const [title, setTitle] = useState('');
    const [publicationMonth, setPublicationMonth] = useState(0);
    const [publicationYear, setPublicationYear] = useState(0);
    const [authors, setAuthors] = useState([]);
    const [doi, setDoi] = useState('');
    const [publishedIn, setPublishedIn] = useState('');
    const [researchField, setResearchField] = useState('');
    const [url, setUrl] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const abstract = useSelector(state => state.viewPaper.abstract);

    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
    const user = useSelector(state => state.auth.user);

    const loadPaperData = async id => {
        setIsLoadingEdit(true);
        const paper = await getResource(id);
        const paperStatements = await getStatementsBySubject({ id });
        const authorList = paperStatements.find(_statement => _statement.predicate.id === PREDICATES.HAS_AUTHORS);
        const authorStatements = await getStatementsBySubject({ id: authorList?.object?.id, sortBy: 'index', desc: false });
        const _isVerified = await getIsVerified(id).catch(() => false);

        const data = {
            paper,
            authors: [],
            isVerified: _isVerified,
        };

        const propertyIdToKey = {
            [PREDICATES.HAS_PUBLICATION_MONTH]: 'month',
            [PREDICATES.HAS_PUBLICATION_YEAR]: 'year',
            [PREDICATES.HAS_DOI]: 'doi',
            [PREDICATES.HAS_VENUE]: 'publishedIn',
            [PREDICATES.HAS_RESEARCH_FIELD]: 'researchField',
            [PREDICATES.URL]: 'url',
        };

        for (const { predicate: property, object, id: statementId } of paperStatements) {
            if (property.id in propertyIdToKey) {
                data[propertyIdToKey[property.id]] = {
                    ...object,
                    statementId: property.id === PREDICATES.HAS_RESEARCH_FIELD || property.id === PREDICATES.HAS_VENUE ? statementId : undefined,
                };
            }
        }
        data.authors = authorStatements.map(statement => statement.object);
        data.authorListResource = authorList?.object;
        setIsLoadingEdit(false);
        return data;
    };

    const updateOrCreateLiteral = async ({ id = null, label, predicateId, paperId }) => {
        if (id) {
            updateLiteral(id, label);
            return {
                id,
                label,
            };
        }
        if (label) {
            const newLiteral = await createLiteralApi(label);
            createLiteralStatement(paperId, predicateId, newLiteral.id);
            return {
                id: newLiteral.id,
                label,
            };
        }
        return null;
    };

    useEffect(() => {
        if (!paperData) {
            return;
        }
        setTitle(paperData.paper?.label ?? '');
        setPublicationMonth(paperData.month?.label ?? '');
        setPublicationYear(paperData.year?.label ?? '');
        setAuthors(paperData.authors ?? []);
        setDoi(paperData.doi?.label ?? '');
        setPublishedIn(paperData.publishedIn ?? '');
        setResearchField(paperData.researchField ?? '');
        setUrl(paperData.url?.label ?? '');
        setIsVerified(!!paperData.isVerified);
    }, [paperData]);

    const handleSave = async () => {
        try {
            // Validate title
            if (!title || title.trim().length < 1) {
                toast.error('Please enter the title of this paper');
                return;
            }

            // Validate URL
            if (url && !new RegExp(REGEX.URL).test(url.trim())) {
                toast.error('Please enter a valid paper URL');
                return;
            }

            setIsLoadingEdit(true);

            const paperId = paperData?.paper?.id;

            const updatedData = {
                paper: {
                    ...paperData.paper,
                    label: title,
                },
                publishedIn,
                researchField,
            };

            // title
            updateResource(paperId, title);

            // authors
            updatedData.authors = await updateAuthorsList({
                prevAuthors: paperData.authors,
                newAuthors: authors,
                listId: paperData?.authorListResource?.id,
            });

            if (publishedIn?.statementId && publishedIn?.id) {
                // update venue
                await updateStatement(publishedIn.statementId, { object_id: publishedIn.id });
            } else if (publishedIn?.id && !publishedIn?.statementId) {
                // add venue
                await createResourceStatement(paperId, PREDICATES.HAS_VENUE, publishedIn.id);
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
                const statement = await createResourceStatement(paperId, PREDICATES.HAS_RESEARCH_FIELD, researchField.id);
                updatedData.researchField = { ...researchField, statementId: statement.id };
            }

            // update literals
            updatedData.month = await updateOrCreateLiteral({
                id: paperData.month?.id,
                label: publicationMonth,
                predicateId: PREDICATES.HAS_PUBLICATION_MONTH,
                paperId,
            });

            updatedData.year = await updateOrCreateLiteral({
                id: paperData.year?.id,
                label: publicationYear,
                predicateId: PREDICATES.HAS_PUBLICATION_YEAR,
                paperId,
            });

            updatedData.doi = await updateOrCreateLiteral({
                id: paperData.doi?.id,
                label: doi,
                predicateId: PREDICATES.HAS_DOI,
                paperId,
            });

            updatedData.url = await updateOrCreateLiteral({
                id: paperData.url?.id,
                label: url,
                predicateId: PREDICATES.URL,
                paperId,
            });

            updatedData.isVerified = isVerified;

            if (!!user && user.isCurationAllowed) {
                if (isVerified) {
                    markAsVerified(paperId, isVerified).catch(() => {});
                } else {
                    markAsUnverified(paperId, isVerified).catch(() => {});
                }
            }

            if (updatedData && afterUpdate) {
                toast.success('Paper updated successfully');
                afterUpdate(updatedData);
            }
        } catch (e) {
            console.error(e);
            toast.error('Something went wrong while saving the paper');
        } finally {
            setIsLoadingEdit(false);
        }
    };

    return {
        doi,
        setDoi,
        title,
        setTitle,
        url,
        setUrl,
        researchField,
        setResearchField,
        publishedIn,
        setPublishedIn,
        authors,
        setAuthors,
        publicationYear,
        setPublicationYear,
        publicationMonth,
        setPublicationMonth,
        handleSave,
        isLoadingEdit,
        isVerified,
        setIsVerified,
        loadPaperData,
        abstract,
    };
};

export default useEditPaper;
