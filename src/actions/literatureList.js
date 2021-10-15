import * as type from 'actions/types';
import arrayMove from 'array-move';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { createLiteral, updateLiteral } from 'services/backend/literals';
import { createResource, updateResource } from 'services/backend/resources';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementById,
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

export const addListEntry = ({ paperData, sectionId }) => async dispatch => {
    const entryResource = await createResource('Entry');
    const statement = await createResourceStatement(sectionId, PREDICATES.HAS_ENTRY, entryResource.id);
    await createResourceStatement(entryResource.id, PREDICATES.HAS_PAPER, paperData.paper.id);

    dispatch({
        type: type.LITERATURE_LIST_ADD_LIST_ENTRY,
        payload: {
            entry: entryResource,
            statementId: statement.id,
            sectionId,
            paperData: paperData
        }
    });
};

export const deleteListEntry = ({ statementId, sectionId }) => async dispatch => {
    deleteStatementById(statementId);
    dispatch({
        type: type.LITERATURE_LIST_DELETE_LIST_ENTRY,
        payload: {
            statementId,
            sectionId
        }
    });
};

export const updateListEntry = entry => async dispatch => {
    dispatch({
        type: type.LITERATURE_LIST_UPDATE_LIST_ENTRY,
        payload: {
            entry
        }
    });
};

export const updateListEntryDescription = ({ description, entryId, descriptionLiteralId, sectionId }) => async dispatch => {
    console.log('{ description, entryId, descriptionLiteralId, sectionId }', { description, entryId, descriptionLiteralId, sectionId });
    dispatch(setIsLoading(true));
    if (!descriptionLiteralId) {
        const descriptionLiteral = await createLiteral(description);
        createLiteralStatement(entryId, PREDICATES.DESCRIPTION, descriptionLiteral.id);
    } else {
        updateLiteral(descriptionLiteralId, description);
    }

    dispatch({
        type: type.LITERATURE_LIST_UPDATE_LIST_ENTRY_DESCRIPTION,
        payload: {
            description,
            entryId,
            sectionId
        }
    });
    dispatch(setIsLoading(false));
};

export const sortListEntries = ({ sectionId, entries, oldIndex, newIndex }) => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch(setIsLoadingSort(true));

    const entriesNewOrder = arrayMove(entries, oldIndex, newIndex);

    dispatch({
        type: type.LITERATURE_LIST_SORT_LIST_ENTRIES,
        payload: {
            entries: entriesNewOrder,
            sectionId
        }
    });

    const sectionSubjectStatement = await getStatementsBySubjectAndPredicate({ subjectId: sectionId, predicateId: PREDICATES.HAS_ENTRY });
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds(sectionSubjectStatementIds);

    for (const entry of entriesNewOrder) {
        await createResourceStatement(sectionId, PREDICATES.HAS_ENTRY, entry.entry.id);
    }

    dispatch(setIsLoading(false));
    dispatch(setIsLoadingSort(false));
};
