import * as type from 'actions/types';
import dotProp from 'dot-prop-immutable';

const initialState = {
    paperResource: {},
    authorResources: [],
    sections: [],
    isLoading: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case type.ARTICLE_WRITER_LOAD: {
            const { paperResource, authorResources, sections } = action.payload;

            return {
                ...state,
                paperResource,
                authorResources,
                sections
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

            return {
                ...state,
                paperResource: {
                    ...state.paperResource,
                    title
                }
            };
        }
        case type.ARTICLE_WRITER_UPDATE_SECTION_TITLE: {
            const { sectionId, title } = action.payload;
            const index = state.sections.findIndex(section => section.id === sectionId);
            return dotProp.set(state, `sections.${index}.title.label`, title);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_MARKDOWN: {
            const { id, markdown } = action.payload;
            const index = state.sections.findIndex(section => section.markdown.id === id);
            return dotProp.set(state, `sections.${index}.markdown.label`, markdown);
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_TYPE: {
            const { sectionId, sectionType } = action.payload;
            console.log(action);
            console.log('sectionId', sectionId);
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
                        markdown: {
                            id: markdownId,
                            label: 'text'
                        }
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
