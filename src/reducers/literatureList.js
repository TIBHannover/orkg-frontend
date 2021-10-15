import * as type from 'actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    id: null,
    literatureList: {},
    authorResources: [],
    sections: [],
    versions: [],
    papers: {},
    researchField: {},
    isLoading: false,
    isLoadingSortSection: false,
    isEditing: false,
    isPublished: false,
    isOpenHistoryModal: false,
    statements: []
};

const literatureList = (state = initialState, action) => {
    switch (action.type) {
        case type.LITERATURE_LIST_LOAD: {
            return {
                ...state,
                ...action.payload
            };
        }
        case type.LITERATURE_LIST_SET_IS_EDITING: {
            const { isEditing } = action;

            return {
                ...state,
                isEditing
            };
        }

        case type.LITERATURE_LIST_SET_IS_LOADING: {
            const { isLoading } = action;

            return {
                ...state,
                isLoading
            };
        }

        case type.LITERATURE_LIST_UPDATE_TITLE: {
            const { title } = action;
            return dotProp.set(state, `literatureList.title`, title);
        }

        case type.LITERATURE_LIST_SET_RESEARCH_FIELD: {
            const { researchField } = action.payload;

            return {
                ...state,
                researchField
            };
        }

        case type.LITERATURE_LIST_UPDATE_AUTHORS: {
            const { authorResources } = action;

            return {
                ...state,
                authorResources
            };
        }
        case type.LITERATURE_LIST_UPDATE_SECTION_TITLE: {
            const { sectionId, title } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${index}.title`, title);
        }

        case type.LITERATURE_LIST_UPDATE_SECTION_MARKDOWN: {
            const { id, markdown } = action.payload;
            const index = state.sections.findIndex(section => section.content && section.content.id === id);
            return dotProp.set(state, `sections.${index}.content.text`, markdown);
        }

        case type.LITERATURE_LIST_DELETE_SECTION: {
            const { id } = action.payload;
            const index = state.sections.findIndex(section => section.id === id);
            return dotProp.delete(state, `sections.${index}`);
        }

        case type.LITERATURE_LIST_CREATE_SECTION: {
            const { afterIndex, sectionId, markdownId, typeId } = action.payload;

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
                            : undefined
                    },
                    ...state.sections.slice(afterIndex)
                ]
            };
        }

        case type.LITERATURE_LIST_SORT_SECTIONS: {
            const { sections } = action.payload;

            return {
                ...state,
                sections
            };
        }

        case type.LITERATURE_LIST_SET_VERSIONS: {
            const { versions } = action.payload;

            return {
                ...state,
                versions
            };
        }

        case type.LITERATURE_LIST_TOGGLE_HISTORY_MODAL: {
            return {
                ...state,
                isOpenHistoryModal: !state.isOpenHistoryModal
            };
        }

        case type.LITERATURE_LIST_SET_IS_LOADING_SORT: {
            const { isLoading } = action.payload;

            return {
                ...state,
                isLoadingSortSection: isLoading
            };
        }
        case type.LITERATURE_LIST_ADD_LIST_ENTRY: {
            const { entry, sectionId, statementId, paperData } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            const newState = dotProp.set(state, `sections.${index}.entries`, [
                ...state.sections[index].entries,
                {
                    entry,
                    statementId,
                    paperId: paperData.paper.id
                }
            ]);
            return dotProp.set(newState, `papers.${paperData.paper.id}`, paperData);
        }

        case type.LITERATURE_LIST_DELETE_LIST_ENTRY: {
            const { statementId, sectionId } = action.payload;
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            const entryIndex = state.sections[sectionIndex].entries.findIndex(section => section.statementId === statementId);
            return dotProp.delete(state, `sections.${sectionIndex}.entries.${entryIndex}`);
        }

        case type.LITERATURE_LIST_UPDATE_LIST_ENTRY: {
            const { entry } = action.payload;
            return dotProp.set(state, `papers.${entry.paper.id}`, { ...state.papers[entry.paper.id], ...entry });
        }

        case type.LITERATURE_LIST_UPDATE_LIST_ENTRY_DESCRIPTION: {
            const { entryId, sectionId, description } = action.payload;
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            const entryIndex = state.sections[sectionIndex].entries.findIndex(entry => entry.entry.id === entryId);
            return dotProp.set(state, `sections.${sectionIndex}.entries.${entryIndex}.description.label`, description);
        }

        case type.LITERATURE_LIST_SORT_LIST_ENTRIES: {
            const { sectionId, entries } = action.payload;
            const sectionIndex = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${sectionIndex}.entries`, entries);
        }

        default: {
            return state;
        }
    }
};

export default literatureList;
