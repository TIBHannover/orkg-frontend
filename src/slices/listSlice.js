import { createSlice } from '@reduxjs/toolkit';
import arrayMove from 'array-move';
import { LOCATION_CHANGE } from 'utils';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import dotProp from 'dot-prop-immutable';
import { cloneDeep } from 'lodash';
import { match } from 'path-to-regexp';
import { toast } from 'react-toastify';
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

const initialState = {
    id: null,
    list: {},
    authorResources: [],
    sections: [],
    versions: [],
    contentTypes: {},
    researchField: {},
    isLoading: false,
    isLoadingSortSection: false,
    isEditing: false,
    isPublished: false,
    isOpenHistoryModal: false,
    statements: []
};

export const listSlice = createSlice({
    name: 'list',
    initialState,
    reducers: {
        listLoaded: (state, { payload }) => {
            return {
                ...state,
                ...payload
            };
        },
        setIsEditing: (state, { payload }) => {
            state.isEditing = payload;
        },
        setIsLoading: (state, { payload }) => {
            state.isLoading = payload;
        },
        titleUpdated: (state, { payload }) => {
            state.list.title = payload;
        },
        researchFieldUpdated: (state, { payload }) => {
            state.researchField = payload;
        },
        authorsUpdated: (state, { payload }) => {
            state.authorResources = payload;
        },
        sectionTitleUpdated: (state, { payload }) => {
            const index = state.sections.findIndex(section => section.id === payload.sectionId);
            state.sections[index].title = payload.title;
        },
        sectionMarkdownUpdated: (state, { payload }) => {
            const index = state.sections.findIndex(section => section.content?.id === payload.id);
            state.sections[index].content.text = payload.markdown;
        },
        sectionHeadingLevelUpdated: (state, { payload }) => {
            const index = state.sections.findIndex(section => section.heading && section.heading.id === payload.id);
            state.sections[index].heading.level = payload.level;
        },
        sectionDeleted: (state, { payload }) => {
            state.sections = state.sections.filter(section => section.id !== payload);
        },
        sectionAdded: (state, { payload }) => {
            const { afterIndex, sectionId, markdownId, typeId, headingId, headingLevel } = payload;

            return {
                ...state,
                sections: [
                    ...state.sections.slice(0, afterIndex),
                    {
                        id: sectionId,
                        title: '',
                        type: typeId,
                        content: markdownId
                            ? {
                                  id: markdownId,
                                  text: ''
                              }
                            : undefined,
                        heading: headingId
                            ? {
                                  id: headingId,
                                  level: headingLevel
                              }
                            : undefined,
                        entries: []
                    },
                    ...state.sections.slice(afterIndex)
                ]
            };
        },
        sectionsSorted: (state, { payload }) => {
            state.sections = payload;
        },
        versionsSet: (state, { payload }) => {
            state.versions = payload;
        },
        historyModalToggled: state => {
            state.isOpenHistoryModal = !state.isOpenHistoryModal;
        },
        isLoadingSortSectionSet: (state, { payload }) => {
            state.isLoadingSortSection = payload;
        },
        listEntryAdded: (state, { payload }) => {
            const { entry, sectionId, statementId, contentTypeData } = payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            state.sections[index].entries.push({
                entry,
                statementId,
                contentTypeId: contentTypeData.contentType.id
            });
            state.contentTypes[contentTypeData.contentType.id] = contentTypeData;
        },
        listEntryDeleted: (state, { payload }) => {
            const { statementId, sectionId } = payload;
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            state.sections[sectionIndex].entries = state.sections[sectionIndex].entries.filter(entry => entry.statementId !== statementId);
        },
        listEntryUpdated: (state, { payload }) => {
            state.contentTypes[payload.contentType.id] = { ...state.contentTypes[payload.contentType.id], ...payload };
        },
        listEntryDescriptionUpdated: (state, { payload }) => {
            const { entryId, sectionId, description } = payload;
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            const entryIndex = state.sections[sectionIndex].entries.findIndex(entry => entry.entry.id === entryId);
            return dotProp.set(state, `sections.${sectionIndex}.entries.${entryIndex}.description.label`, description);
        },
        listEntriesSorted: (state, { payload }) => {
            const { sectionId, entries } = payload;
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            state.sections[sectionIndex].entries = entries;
        }
    },
    extraReducers: {
        [LOCATION_CHANGE]: (state, { payload }) => {
            const matchList = match(ROUTES.LIST);
            const parsed_payload = matchList(payload.location.pathname);
            if (parsed_payload && parsed_payload.params?.id === state.id) {
                return state;
            }
            return initialState;
        }
    }
});

export const {
    listLoaded,
    setIsEditing,
    setIsLoading,
    titleUpdated,
    researchFieldUpdated,
    authorsUpdated,
    sectionTitleUpdated,
    sectionMarkdownUpdated,
    sectionHeadingLevelUpdated,
    sectionDeleted,
    sectionAdded,
    sectionsSorted,
    versionsSet,
    historyModalToggled,
    isLoadingSortSectionSet,
    listEntryAdded,
    listEntryDeleted,
    listEntryUpdated,
    listEntryDescriptionUpdated,
    listEntriesSorted
} = listSlice.actions;

export default listSlice.reducer;

export const updateTitle = ({ id, title }) => async dispatch => {
    dispatch(titleUpdated(title));
    dispatch(setIsLoading(true));
    await updateResource(id, title);
    dispatch(setIsLoading(false));
};

export const updateResearchField = ({ statementId, listId, researchField }) => async dispatch => {
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

    dispatch(researchFieldUpdated(researchField));
};

export const updateSectionTitle = ({ sectionId, title }) => async dispatch => {
    dispatch(
        sectionTitleUpdated({
            title,
            sectionId
        })
    );
    dispatch(setIsLoading(true));
    await updateResource(sectionId, title);
    dispatch(setIsLoading(false));
};

export const updateSectionHeadingLevel = ({ id, level }) => async dispatch => {
    dispatch(
        sectionHeadingLevelUpdated({
            level,
            id
        })
    );
    dispatch(setIsLoading(true));
    await updateLiteral(id, level);
    dispatch(setIsLoading(false));
};

export const updateSectionMarkdown = ({ id, markdown }) => async dispatch => {
    dispatch(
        sectionMarkdownUpdated({
            markdown,
            id
        })
    );
    dispatch(setIsLoading(true));
    await updateLiteral(id, markdown);
    dispatch(setIsLoading(false));
};

export const deleteSection = id => async dispatch => {
    try {
        dispatch(setIsLoading(true));
        const sectionObjectStatement = await getStatementsByObject({ id });
        const sectionSubjectStatement = await getStatementsBySubject({ id });
        const sectionObjectStatementIds = sectionObjectStatement.map(stmt => stmt.id);
        const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
        await deleteStatementsByIds([...sectionObjectStatementIds, ...sectionSubjectStatementIds]);
        //the resource isn't deleted, because deleting resources can only be done with the is_curation_allowed flag
        //await deleteResource(id);
        dispatch(sectionDeleted(id));
        dispatch(setIsLoading(false));
        toast.success('Section successfully deleted');
    } catch (e) {
        toast.error('Section not deleted, reload the page and try again');
    }
};

export const createSection = ({ listId, afterIndex, sectionType }) => async (dispatch, getState) => {
    dispatch(setIsLoading(true));
    dispatch(isLoadingSortSectionSet(true));

    let typeId = '';
    let sectionResourceId = null;
    let markdownLiteralId = null;
    let headingLiteralId = null;
    const headingLevel = 2;
    if (sectionType === 'text') {
        // markdown section
        typeId = CLASSES.TEXT_SECTION;

        const sectionResource = await createResource('', [typeId]);
        const markdownLiteral = await createLiteral('');
        await createResourceStatement(listId, PREDICATES.HAS_SECTION, sectionResource.id);
        await createLiteralStatement(sectionResource.id, PREDICATES.HAS_CONTENT, markdownLiteral.id);
        sectionResourceId = sectionResource.id;
        markdownLiteralId = markdownLiteral.id;
        const headingLiteral = await createLiteral(headingLevel);
        await createLiteralStatement(sectionResource.id, PREDICATES.HAS_HEADING_LEVEL, headingLiteral.id);
        headingLiteralId = headingLiteral.id;
    } else if (sectionType === 'list') {
        // markdown section
        typeId = CLASSES.LIST_SECTION;

        const sectionResource = await createResource('', [typeId]);
        await createResourceStatement(listId, PREDICATES.HAS_SECTION, sectionResource.id);
        sectionResourceId = sectionResource.id;
    }
    dispatch(
        sectionAdded({
            afterIndex,
            sectionId: sectionResourceId,
            markdownId: markdownLiteralId,
            headingId: headingLiteralId,
            headingLevel,
            typeId
        })
    );
    // sort the sections after adding a new section
    dispatch(
        sortSections({
            listId,
            sections: getState().list.sections
        })
    );
    dispatch(setIsLoading(false));
};

export const sortSections = ({ listId, sections }) => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch(isLoadingSortSectionSet(true));
    dispatch(sectionsSorted(sections));

    const sectionSubjectStatement = await getStatementsBySubjectAndPredicate({ subjectId: listId, predicateId: PREDICATES.HAS_SECTION });
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds(sectionSubjectStatementIds);

    for (const section of sections) {
        await createResourceStatement(listId, PREDICATES.HAS_SECTION, section.id);
    }

    dispatch(setIsLoading(false));
    dispatch(isLoadingSortSectionSet(false));
};

export const moveSection = ({ listId, sections, oldIndex, newIndex }) => async dispatch => {
    const sectionsNewOrder = arrayMove(sections, oldIndex, newIndex);
    dispatch(sortSections({ listId, sections: sectionsNewOrder }));
};

export const addListEntry = ({ contentTypeData, sectionId }) => async dispatch => {
    const entryResource = await createResource('Entry');
    const statement = await createResourceStatement(sectionId, PREDICATES.HAS_ENTRY, entryResource.id);
    await createResourceStatement(entryResource.id, PREDICATES.HAS_LINK, contentTypeData.contentType.id);

    dispatch(
        listEntryAdded({
            entry: entryResource,
            statementId: statement.id,
            sectionId,
            contentTypeData
        })
    );
};

export const deleteListEntry = ({ statementId, sectionId }) => async dispatch => {
    try {
        await deleteStatementById(statementId);
        dispatch(
            listEntryDeleted({
                statementId,
                sectionId
            })
        );
        toast.success('The entry has been deleted successfully');
    } catch (e) {
        toast.error('The entry is not deleted. Reload the page and try again');
    }
};

export const updateListEntryDescription = ({ description, entryId, descriptionLiteralId, sectionId }) => async dispatch => {
    dispatch(setIsLoading(true));
    if (!descriptionLiteralId) {
        const descriptionLiteral = await createLiteral(description);
        createLiteralStatement(entryId, PREDICATES.DESCRIPTION, descriptionLiteral.id);
    } else {
        updateLiteral(descriptionLiteralId, description);
    }

    dispatch(
        listEntryDescriptionUpdated({
            description,
            entryId,
            sectionId
        })
    );
    dispatch(setIsLoading(false));
};

export const sortListEntries = ({ sectionId, entries, oldIndex, newIndex }) => async dispatch => {
    dispatch(setIsLoading(true));
    dispatch(isLoadingSortSectionSet(true));

    const entriesNewOrder = cloneDeep(arrayMove(entries, oldIndex, newIndex));
    const sectionSubjectStatement = await getStatementsBySubjectAndPredicate({ subjectId: sectionId, predicateId: PREDICATES.HAS_ENTRY });
    const sectionSubjectStatementIds = sectionSubjectStatement.map(stmt => stmt.id);
    await deleteStatementsByIds(sectionSubjectStatementIds);

    for (const [index, entry] of entriesNewOrder.entries()) {
        const { id } = await createResourceStatement(sectionId, PREDICATES.HAS_ENTRY, entry.entry.id);
        entriesNewOrder[index].statementId = id;
    }

    dispatch(
        listEntriesSorted({
            entries: entriesNewOrder,
            sectionId
        })
    );

    dispatch(setIsLoading(false));
    dispatch(isLoadingSortSectionSet(false));
};
