import * as type from 'actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    paper: {},
    authorResources: [],
    contributionId: 0,
    sections: [],
    versions: [],
    researchField: {},
    isLoading: false,
    isPublished: false,
    isOpenHistoryModal: false,
    statements: []
};

const smartArticle = (state = initialState, action) => {
    switch (action.type) {
        case type.ARTICLE_WRITER_LOAD: {
            const { paper, authorResources, sections, contributionId, isPublished, versions, statements, researchField } = action.payload;

            return {
                ...state,
                contributionId,
                paper,
                authorResources,
                sections,
                isPublished,
                versions,
                statements,
                researchField
            };
        }

        case type.ARTICLE_WRITER_SET_IS_LOADING: {
            const { isLoading } = action;

            return {
                ...state,
                isLoading
            };
        }

        case type.ARTICLE_WRITER_UPDATE_TITLE: {
            const { title } = action;
            return dotProp.set(state, `paper.title`, title);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_TITLE: {
            const { sectionId, title } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${index}.title.label`, title);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_MARKDOWN: {
            const { id, markdown } = action.payload;
            const index = state.sections.findIndex(section => section.markdown && section.markdown.id === id);
            return dotProp.set(state, `sections.${index}.markdown.label`, markdown);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_LINK: {
            const { id, label, objectId } = action.payload;
            const index = state.sections.findIndex(section => section?.id === id);
            let newState;
            newState = dotProp.set(state, `sections.${index}.contentLink.objectId`, objectId);
            newState = dotProp.set(newState, `sections.${index}.contentLink.label`, label);
            return newState;
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_TYPE: {
            const { sectionId, sectionType } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${index}.type.id`, sectionType);
        }

        case type.ARTICLE_WRITER_CREATE_SECTION: {
            const { afterIndex, sectionId, markdownId, typeId } = action.payload;

            return {
                ...state,
                sections: [
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
                            : undefined
                    },
                    ...state.sections.slice(afterIndex)
                ]
            };
        }

        case type.ARTICLE_WRITER_UPDATE_AUTHORS: {
            const { authorResources } = action;

            return {
                ...state,
                authorResources
            };
        }

        case type.ARTICLE_WRITER_DELETE_SECTION: {
            const { id } = action.payload;
            const index = state.sections.findIndex(section => section.id === id);
            return dotProp.delete(state, `sections.${index}`);
        }

        case type.ARTICLE_WRITER_SORT_SECTIONS: {
            const { sections } = action.payload;

            return {
                ...state,
                sections
            };
        }

        case type.ARTICLE_WRITER_TOGGLE_OPEN_HISTORY_MODAL: {
            return {
                ...state,
                isOpenHistoryModal: !state.isOpenHistoryModal
            };
        }

        case type.ARTICLE_WRITER_SET_RESEARCH_FIELD: {
            const { researchField } = action.payload;

            return {
                ...state,
                researchField
            };
        }

        case '@@router/LOCATION_CHANGE': {
            return {
                ...initialState
            };
        }

        default: {
            return state;
        }
    }
};

export default smartArticle;
