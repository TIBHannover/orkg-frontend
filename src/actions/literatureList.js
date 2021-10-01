import * as type from 'actions/types';
import arrayMove from 'array-move';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { createLiteral, updateLiteral } from 'services/backend/literals';
import { createResource, updateResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementsByIds,
    getStatementsByObject,
    getStatementsBySubject,
    getStatementsBySubjectAndPredicate,
    updateStatement
} from 'services/backend/statements';

export const load = payload => dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_LOAD,
        payload
    });
};

export const setIsEditing = isEditing => dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_SET_IS_EDITING,
        isEditing
    });
};

export const updateTitle = ({ id, title }) => async dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_UPDATE_TITLE,
        title
    });
    dispatch(setIsLoading(true));
    await updateResource(id, title);
    dispatch(setIsLoading(false));
};

export const setIsLoading = isLoading => dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_SET_IS_LOADING,
        isLoading
    });
};

export const setResearchField = ({ statementId, listId, researchField }) => async dispatch => {
    if (statementId) {
        updateStatement(statementId, {
            subject_id: listId,
            predicate_id: PREDICATES.HAS_RESEARCH_FIELD,
            object_id: researchField.id
        });
    } else {
        const statement = await createResourceStatement(listId, PREDICATES.HAS_RESEARCH_FIELD, researchField.id);
        statementId = statement.id;
    }
    researchField.statementId = statementId;

    dispatch({
        type: type.LITERATURE_LIST_SET_RESEARCH_FIELD,
        payload: {
            researchField
        }
    });
};

export const updateAuthors = authorResources => async dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_UPDATE_AUTHORS,
        authorResources
    });
};

export const updateSectionTitle = ({ sectionId, title }) => async dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_UPDATE_SECTION_TITLE,
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
        type: type.LITERATURE_LIST_UPDATE_SECTION_MARKDOWN,
        payload: {
            markdown,
            id
        }
    });
    dispatch(setIsLoading(true));
    await updateLiteral(id, markdown);
    dispatch(setIsLoading(false));
};

export const deleteSection = id => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch({
        type: type.LITERATURE_LIST_DELETE_SECTION,
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

export const createSection = ({ listId, afterIndex, sectionType }) => async (dispatch, getState) => {
    dispatch(setIsLoading(true));
    dispatch(setIsLoadingSort(true));

    let typeId = '';
    let sectionResourceId = null;
    let markdownLiteralId = null;

    if (sectionType === 'text') {
        // markdown section
        typeId = CLASSES.TEXT_SECTION;

        const sectionResource = await createResource('', [typeId]);
        const markdownLiteral = await createLiteral('');
        await createResourceStatement(listId, PREDICATES.HAS_SECTION, sectionResource.id);
        await createLiteralStatement(sectionResource.id, PREDICATES.HAS_CONTENT, markdownLiteral.id);
        sectionResourceId = sectionResource.id;
        markdownLiteralId = markdownLiteral.id;
    } else if (sectionType === 'list') {
        // markdown section
        typeId = CLASSES.LIST_SECTION;

        const sectionResource = await createResource('', [typeId]);
        const markdownLiteral = await createLiteral('');
        await createResourceStatement(listId, PREDICATES.HAS_SECTION, sectionResource.id);
        await createLiteralStatement(sectionResource.id, PREDICATES.HAS_CONTENT, markdownLiteral.id);
        sectionResourceId = sectionResource.id;
        markdownLiteralId = markdownLiteral.id;
    }
    dispatch({
        type: type.LITERATURE_LIST_CREATE_SECTION,
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
            listId,
            sections: getState().literatureList.sections
        })
    );
    dispatch(setIsLoading(false));
};

export const sortSections = ({ listId, sections }) => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch(setIsLoadingSort(true));

    dispatch({
        type: type.LITERATURE_LIST_SORT_SECTIONS,
        payload: {
            sections
        }
    });

    const sectionSubjectStatement = await getStatementsBySubjectAndPredicate({ subjectId: listId, predicateId: PREDICATES.HAS_SECTION });
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds(sectionSubjectStatementIds);

    for (const section of sections) {
        await createResourceStatement(listId, PREDICATES.HAS_SECTION, section.id);
    }

    dispatch(setIsLoading(false));
    dispatch(setIsLoadingSort(false));
};

export const setIsLoadingSort = isLoading => dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_SET_IS_LOADING_SORT,
        payload: {
            isLoading
        }
    });
};

export const moveSection = ({ listId, sections, oldIndex, newIndex }) => async dispatch => {
    const sectionsNewOrder = arrayMove(sections, oldIndex, newIndex);
    console.log('{ listId, sections, oldIndex, newIndex }', { listId, sections, oldIndex, newIndex });
    dispatch(sortSections({ listId, sections: sectionsNewOrder }));
};

export const setVersions = versions => dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_SET_VERSIONS,
        payload: {
            versions
        }
    });
};

export const toggleHistoryModal = () => ({
    type: type.LITERATURE_LIST_TOGGLE_HISTORY_MODAL
});
