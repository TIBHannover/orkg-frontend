import { createSlice } from '@reduxjs/toolkit';
import { LOCATION_CHANGE } from 'redux-first-history';
import { match } from 'path-to-regexp';
import ROUTES from 'constants/routes';
import arrayMove from 'array-move';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { createLiteral, updateLiteral } from 'services/backend/literals';
import { createResource, updateResource, updateResourceClasses } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementsByIds,
    getStatementsByObject,
    getStatementsBySubject,
    getStatementsBySubjectAndPredicate,
    deleteStatementById,
    updateStatement
} from 'services/backend/statements';

const initialState = {
    articleId: null,
    articleResource: null,
    paper: {},
    authorResources: [],
    contributionId: 0,
    sections: [],
    versions: [],
    comparisons: {},
    researchField: {},
    isLoading: false,
    isLoadingSortSection: false,
    isEditing: false,
    isPublished: false,
    isOpenHistoryModal: false,
    references: [],
    usedReferences: {},
    statements: []
};

export const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        load: (state, { payload }) => {
            state.articleId = payload.articleId;
            state.articleResource = payload.articleResource;
            state.paper = payload.paper;
            state.authorResources = payload.authorResources;
            state.contributionId = payload.contributionId;
            state.sections = payload.sections;
            state.versions = payload.versions;
            state.researchField = payload.researchField;
            state.contributors = payload.contributors;
            state.isPublished = payload.isPublished;
            state.statements = payload.statements;
            state.references = payload.references;
        },
        setIsLoading: (state, { payload }) => {
            state.isLoading = payload;
        },
        setIsEditing: (state, { payload }) => {
            state.isEditing = payload;
        },
        setVersions: (state, { payload }) => {
            state.versions = payload;
        },
        titleUpdated: (state, { payload }) => {
            state.paper.title = payload;
        },
        sectionTitleUpdated: (state, { payload: { sectionId, title } }) => {
            const index = state.sections.findIndex(section => section.id === sectionId);
            state.sections[index].title.label = title;
        },
        sectionMarkdownUpdated: (state, { payload: { id, markdown } }) => {
            const index = state.sections.findIndex(section => section.markdown?.id === id);
            state.sections[index].markdown.label = markdown;
        },
        sectionLinkUpdated: (state, { payload: { id, objectId, label } }) => {
            const index = state.sections.findIndex(section => section?.id === id);
            state.sections[index].contentLink.objectId = objectId;
            state.sections[index].contentLink.label = label;
        },
        sectionTypeUpdated: (state, { payload: { sectionId, sectionType } }) => {
            const index = state.sections.findIndex(section => section.id === sectionId);
            state.sections[index].type.id = sectionType;
        },
        updateAuthors: (state, { payload }) => {
            state.authorResources = payload;
        },
        sectionCreated: (state, { payload: { afterIndex, sectionId, markdownId, typeId } }) => {
            state.sections = [
                ...state.sections.slice(0, afterIndex),
                {
                    id: sectionId,
                    title: {
                        id: sectionId,
                        label: ''
                    },
                    type: {
                        id: typeId
                    },
                    markdown: markdownId
                        ? {
                              id: markdownId,
                              label: ''
                          }
                        : undefined,
                    dataTable: {
                        entities: [],
                        properties: []
                    }
                },
                ...state.sections.slice(afterIndex)
            ];
        },
        sectionDeleted: (state, { payload: { id } }) => {
            const index = state.sections.findIndex(section => section.id === id);
            state.sections.splice(index, 1);
        },
        sectionsSorted: (state, { payload }) => {
            state.sections = payload.sections;
        },
        setIsLoadingSort: (state, { payload }) => {
            state.isLoadingSortSection = payload;
        },
        toggleHistoryModal: state => {
            state.isOpenHistoryModal = !state.isOpenHistoryModal;
        },
        researchFieldUpdated: (state, { payload }) => {
            state.researchField = payload;
        },
        setComparisonData: (state, { payload: { id, data } }) => {
            state.comparisons[id] = data;
        },
        updateDataTable: (state, { payload: { sectionId, dataTable } }) => {
            const index = state.sections.findIndex(section => section.id === sectionId);
            state.sections[index].dataTable = {
                ...state.sections[index].dataTable,
                ...dataTable
            };
        },
        setDataTableStatements: (state, { payload: { id, sectionId, statements } }) => {
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            if (sectionIndex === -1) {
                return state;
            }
            const dataTableIndex = state.sections[sectionIndex]?.dataTable?.entities?.findIndex(entity => entity.id === id);
            if (dataTableIndex === -1) {
                return state;
            }
            state.sections[sectionIndex].dataTable.entities[dataTableIndex] = {
                ...state.sections[sectionIndex].dataTable.entities[dataTableIndex],
                statements
            };
        },
        referenceAdded: (state, { payload: { reference } }) => {
            state.references.push(reference);
        },
        referenceDeleted: (state, { payload }) => {
            state.references = state.references.filter(reference => reference.statementId !== payload);
        },
        referenceUpdated: (state, { payload: { literalId, bibtex, parsedReference } }) => {
            state.references = state.references.map(reference =>
                reference.literal.id === literalId ? { ...reference, literal: { ...reference.literal, label: bibtex }, parsedReference } : reference
            );
        },
        setUsedReferences: (state, { payload: { references, sectionId } }) => {
            state.usedReferences[sectionId] = references;
        }
    },
    extraReducers: {
        [LOCATION_CHANGE]: (state, { payload }) => {
            const matchReview = match(ROUTES.REVIEW);
            const parsed_payload = matchReview(payload.location.pathname);
            if (parsed_payload && parsed_payload.params?.id === state.articleId) {
                // when it's the same review  (just the hash changed) do not init
                return state;
            }
            return initialState;
        }
    }
});

export const {
    load,
    setIsLoading,
    setIsEditing,
    setVersions,
    titleUpdated,
    sectionTitleUpdated,
    sectionMarkdownUpdated,
    sectionLinkUpdated,
    sectionTypeUpdated,
    updateAuthors,
    sectionCreated,
    sectionDeleted,
    sectionsSorted,
    setIsLoadingSort,
    toggleHistoryModal,
    researchFieldUpdated,
    setComparisonData,
    updateDataTable,
    setDataTableStatements,
    referenceAdded,
    referenceDeleted,
    referenceUpdated,
    setUsedReferences
} = reviewSlice.actions;

export default reviewSlice.reducer;

export const updateTitle = ({ id, title }) => async dispatch => {
    // on purpose don't have a blocking update there (so don't wait with dispatching the change before updating resource)
    dispatch(titleUpdated(title));
    dispatch(setIsLoading(true));
    await updateResource(id, title);
    dispatch(setIsLoading(false));
};

export const updateSectionTitle = ({ sectionId, title }) => async dispatch => {
    dispatch(sectionTitleUpdated({ sectionId, title }));
    dispatch(setIsLoading(true));
    await updateResource(sectionId, title);
    dispatch(setIsLoading(false));
};

export const updateSectionMarkdown = ({ id, markdown }) => async dispatch => {
    dispatch(sectionMarkdownUpdated({ id, markdown }));
    dispatch(setIsLoading(true));
    await updateLiteral(id, markdown);
    dispatch(setIsLoading(false));
};

export const updateSectionLink = ({ id, label, objectId }) => async dispatch => {
    dispatch(sectionLinkUpdated({ id, objectId, label }));
    dispatch(setIsLoading(true));
    // delete the current statement (if it exists, not empty sections, this statement doesn't exist)
    const contentStatement = await getStatementsBySubjectAndPredicate({ subjectId: id, predicateId: PREDICATES.HAS_LINK });
    if (contentStatement.length) {
        await deleteStatementById(contentStatement[0].id);
    }
    await createResourceStatement(id, PREDICATES.HAS_LINK, objectId);
    dispatch(setIsLoading(false));
};

export const updateSectionType = ({ sectionId, type: sectionType }) => async dispatch => {
    dispatch(sectionTypeUpdated({ sectionId, sectionType }));
    dispatch(setIsLoading(true));
    await updateResourceClasses(sectionId, [CLASSES.SECTION, sectionType]);
    dispatch(setIsLoading(false));
};

export const sortSections = ({ contributionId, sections }) => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch(setIsLoadingSort(true));

    dispatch(sectionsSorted({ sections }));

    const sectionSubjectStatement = await getStatementsBySubjectAndPredicate({ subjectId: contributionId, predicateId: PREDICATES.HAS_SECTION });
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds(sectionSubjectStatementIds);

    for (const section of sections) {
        await createResourceStatement(contributionId, PREDICATES.HAS_SECTION, section.id);
    }

    dispatch(setIsLoading(false));
    dispatch(setIsLoadingSort(false));
};

export const moveSection = ({ contributionId, sections, oldIndex, newIndex }) => async dispatch => {
    const sectionsNewOrder = arrayMove(sections, oldIndex, newIndex);

    dispatch(sortSections({ contributionId, sections: sectionsNewOrder }));
};

export const createSection = ({ contributionId, afterIndex, sectionType }) => async (dispatch, getState) => {
    dispatch(setIsLoading(true));
    dispatch(setIsLoadingSort(true));

    let typeId = '';
    let sectionResourceId = null;
    let markdownLiteralId = null;

    if (sectionType === 'content') {
        // markdown section
        typeId = CLASSES.SECTION;

        const sectionResource = await createResource('', [typeId]);
        const markdownLiteral = await createLiteral('');
        await createResourceStatement(contributionId, PREDICATES.HAS_SECTION, sectionResource.id);
        await createLiteralStatement(sectionResource.id, PREDICATES.HAS_CONTENT, markdownLiteral.id);
        sectionResourceId = sectionResource.id;
        markdownLiteralId = markdownLiteral.id;
    } else if (
        sectionType === 'resource' ||
        sectionType === 'property' ||
        sectionType === 'comparison' ||
        sectionType === 'visualization' ||
        sectionType === 'ontology'
    ) {
        // link section
        if (sectionType === 'resource') {
            typeId = CLASSES.RESOURCE_SECTION;
        } else if (sectionType === 'property') {
            typeId = CLASSES.PROPERTY_SECTION;
        } else if (sectionType === 'comparison') {
            typeId = CLASSES.COMPARISON_SECTION;
        } else if (sectionType === 'visualization') {
            typeId = CLASSES.VISUALIZATION_SECTION;
        } else if (sectionType === 'ontology') {
            typeId = CLASSES.ONTOLOGY_SECTION;
        }

        const sectionResource = await createResource('', [typeId]);
        await createResourceStatement(contributionId, PREDICATES.HAS_SECTION, sectionResource.id);
        sectionResourceId = sectionResource.id;
    }

    dispatch(sectionCreated({ afterIndex, sectionId: sectionResourceId, markdownId: markdownLiteralId, typeId }));

    // sort the sections after adding a new section
    dispatch(
        sortSections({
            contributionId,
            sections: getState().review.sections
        })
    );
    dispatch(setIsLoading(false));
};

export const deleteSection = id => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch(sectionDeleted({ id }));

    const sectionObjectStatement = await getStatementsByObject({ id });
    const sectionSubjectStatement = await getStatementsBySubject({ id });
    const sectionObjectStatementIds = sectionObjectStatement.map(stmt => stmt.id);
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds([...sectionObjectStatementIds, ...sectionSubjectStatementIds]);
    //the resource isn't deleted, because deleting resources can only be done with the is_curation_allowed flag
    //await deleteResource(id);

    dispatch(setIsLoading(false));
    dispatch(setUsedReferences({ sectionId: id, references: {} }));
};

export const setResearchField = ({ statementId, paperId, researchField }) => async dispatch => {
    if (statementId) {
        updateStatement(statementId, {
            subject_id: paperId,
            predicate_id: PREDICATES.HAS_RESEARCH_FIELD,
            object_id: researchField.id
        });
    } else {
        const statement = await createResourceStatement(paperId, PREDICATES.HAS_RESEARCH_FIELD, researchField.id);
        statementId = statement.id;
    }
    researchField.statementId = statementId;

    dispatch(researchFieldUpdated(researchField));
};

export const saveEntities = ({ sectionId, entities }) => async dispatch => {
    // delete existing statements
    const entityStatements = await getStatementsBySubject({ id: sectionId });
    const entityStatementIds = entityStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_ENTITY).map(statement => statement.id);
    await deleteStatementsByIds(entityStatementIds);

    // create new statements, import to use await to ensure statements are created in the correct order
    for (const entity of entities) {
        await createResourceStatement(sectionId, PREDICATES.HAS_ENTITY, entity.id);
    }

    dispatch(updateDataTable({ sectionId, dataTable: entities }));
};

export const saveShowProperties = ({ sectionId, properties }) => async dispatch => {
    // delete existing statements
    const propertyStatements = await getStatementsBySubject({ id: sectionId });
    const propertyStatementIds = propertyStatements
        .filter(statement => statement.predicate.id === PREDICATES.SHOW_PROPERTY)
        .map(statement => statement.id);
    await deleteStatementsByIds(propertyStatementIds);

    // create new statements
    for (const property of properties) {
        await createResourceStatement(sectionId, PREDICATES.SHOW_PROPERTY, property.id);
    }

    dispatch(updateDataTable({ sectionId, dataTable: properties }));
};

export const reloadDataTableStatements = ({ id, sectionId }) => async dispatch => {
    const statements = await getStatementsBySubject({ id });

    dispatch(setDataTableStatements({ id, sectionId, statements }));
};

export const createReference = ({ contributionId, bibtex, parsedReference }) => dispatch => {
    return createLiteral(bibtex)
        .then(async literal => {
            const { id: statementId } = await createLiteralStatement(contributionId, PREDICATES.HAS_REFERENCE, literal.id);
            dispatch(referenceAdded({ reference: { statementId, literal, parsedReference } }));
            return Promise.resolve();
        })
        .catch(e => {
            console.log(e);
            return Promise.resolve();
        });
};

export const deleteReference = statementId => dispatch => {
    return deleteStatementById(statementId)
        .then(() => {
            dispatch(referenceDeleted(statementId));
            return Promise.resolve();
        })
        .catch(e => {
            console.log(e);
            return Promise.resolve();
        });
};

export const updateReference = ({ literalId, bibtex, parsedReference }) => dispatch => {
    return updateLiteral(literalId, bibtex)
        .then(literal => {
            dispatch(referenceUpdated({ literalId, bibtex, parsedReference }));
            return Promise.resolve();
        })
        .catch(e => {
            console.log(e);
            return Promise.resolve();
        });
};
