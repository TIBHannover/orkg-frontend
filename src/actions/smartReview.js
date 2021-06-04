import * as type from 'actions/types';
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

export const load = payload => dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_LOAD,
        payload
    });
};

export const setIsLoading = isLoading => dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_SET_IS_LOADING,
        isLoading
    });
};

export const setIsEditing = isEditing => dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_SET_IS_EDITING,
        isEditing
    });
};
export const setVersions = versions => dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_SET_VERSIONS,
        payload: {
            versions
        }
    });
};

export const updateTitle = ({ id, title }) => async dispatch => {
    // on purpose don't have a blocking update there (so don't wait with dispatching the change before updating resource)
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_TITLE,
        title
    });
    dispatch(setIsLoading(true));
    await updateResource(id, title);
    dispatch(setIsLoading(false));
};

export const updateSectionTitle = ({ sectionId, title }) => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_SECTION_TITLE,
        payload: {
            title,
            sectionId
        }
    });
    dispatch(setIsLoading(true));
    await updateResource(sectionId, title);
    dispatch(setIsLoading(false));
};

export const updateSectionMarkdown = ({ id, markdown }) => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_SECTION_MARKDOWN,
        payload: {
            markdown,
            id
        }
    });
    dispatch(setIsLoading(true));
    await updateLiteral(id, markdown);
    dispatch(setIsLoading(false));
};

export const updateSectionLink = ({ id, label, objectId }) => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_SECTION_LINK,
        payload: {
            id,
            label,
            objectId
        }
    });
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
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_SECTION_TYPE,
        payload: {
            sectionType,
            sectionId
        }
    });
    dispatch(setIsLoading(true));
    await updateResourceClasses(sectionId, [CLASSES.SECTION, sectionType]);
    dispatch(setIsLoading(false));
};

export const updateAuthors = authorResources => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_AUTHORS,
        authorResources
    });
};

export const createSection = ({ contributionId, afterIndex, sectionType }) => async (dispatch, getState) => {
    dispatch(setIsLoading(true));

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

    dispatch({
        type: type.ARTICLE_WRITER_CREATE_SECTION,
        payload: {
            afterIndex,
            sectionId: sectionResourceId,
            markdownId: markdownLiteralId,
            typeId
        }
    });
    // sort the sections after adding a new section
    dispatch(
        sortSections({
            contributionId,
            sections: getState().smartReview.sections
        })
    );
    dispatch(setIsLoading(false));
};

export const deleteSection = id => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch({
        type: type.ARTICLE_WRITER_DELETE_SECTION,
        payload: {
            id
        }
    });

    const sectionObjectStatement = await getStatementsByObject({ id });
    const sectionSubjectStatement = await getStatementsBySubject({ id });
    const sectionObjectStatementIds = sectionObjectStatement.map(stmt => stmt.id);
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds([...sectionObjectStatementIds, ...sectionSubjectStatementIds]);
    //the resource isn't deleted, because deleting resources can only be done with the is_curation_allowed flag
    //await deleteResource(id);

    dispatch(setIsLoading(false));
};

export const moveSection = ({ contributionId, sections, oldIndex, newIndex }) => async dispatch => {
    const sectionsNewOrder = arrayMove(sections, oldIndex, newIndex);

    dispatch(sortSections({ contributionId, sections: sectionsNewOrder }));
};

export const sortSections = ({ contributionId, sections }) => async dispatch => {
    dispatch(setIsLoading(true));

    dispatch({
        type: type.ARTICLE_WRITER_SORT_SECTIONS,
        payload: {
            sections
        }
    });

    const sectionSubjectStatement = await getStatementsBySubject({ id: contributionId });
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds(sectionSubjectStatementIds);

    for (const section of sections) {
        await createResourceStatement(contributionId, PREDICATES.HAS_SECTION, section.id);
    }

    dispatch(setIsLoading(false));
};

export const toggleHistoryModal = () => ({
    type: type.ARTICLE_WRITER_TOGGLE_OPEN_HISTORY_MODAL
});

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

    dispatch({
        type: type.ARTICLE_WRITER_SET_RESEARCH_FIELD,
        payload: {
            researchField
        }
    });
};

export const setComparisonData = ({ id, data }) => ({
    type: type.ARTICLE_WRITER_SET_COMPARISON_DATA,
    payload: {
        id,
        data
    }
});

export const saveEntities = ({ sectionId, entities }) => async dispatch => {
    // delete existing statements
    const entityStatements = await getStatementsBySubject({ id: sectionId });
    const entityStatementIds = entityStatements.filter(statement => statement.predicate.id === PREDICATES.HAS_ENTITY).map(statement => statement.id);
    await deleteStatementsByIds(entityStatementIds);

    // create new statements, import to use await to ensure statements are created in the correct order
    entities.map(async entity => await createResourceStatement(sectionId, PREDICATES.HAS_ENTITY, entity.id));

    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_DATA_TABLE,
        payload: {
            sectionId,
            dataTable: {
                entities
            }
        }
    });
};

export const saveShowProperties = ({ sectionId, properties }) => async dispatch => {
    // delete existing statements
    const propertyStatements = await getStatementsBySubject({ id: sectionId });
    const propertyStatementIds = propertyStatements
        .filter(statement => statement.predicate.id === PREDICATES.SHOW_PROPERTY)
        .map(statement => statement.id);
    await deleteStatementsByIds(propertyStatementIds);

    // create new statements
    properties.map(async property => await createResourceStatement(sectionId, PREDICATES.SHOW_PROPERTY, property.id));

    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_DATA_TABLE,
        payload: {
            sectionId,
            dataTable: {
                properties
            }
        }
    });
};

export const reloadDataTableStatements = ({ id, sectionId }) => async dispatch => {
    const statements = await getStatementsBySubject({ id });

    dispatch({
        type: type.ARTICLE_WRITER_SET_DATA_TABLE_STATEMENTS,
        payload: {
            id,
            sectionId,
            statements
        }
    });
};
