import * as type from 'actions/types';

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
            const { sectionId, title } = action;

            return {
                ...state,
                sectionResources: [
                    ...state.sections.map(sectionResource => {
                        if (sectionResource.id === sectionId) {
                            return {
                                ...sectionResource,
                                title
                            };
                        }
                        return sectionResource;
                    })
                ]
            };
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_MARKDOWN: {
            const { sectionId, markdown } = action;

            return {
                ...state,
                sectionResources: [
                    ...state.sections.map(sectionResource => {
                        if (sectionResource.id === sectionId) {
                            return {
                                ...sectionResource,
                                markdown
                            };
                        }
                        return sectionResource;
                    })
                ]
            };
        }

        case type.ARTICLE_WRITER_UPDATE_SECTION_TYPE: {
            const { sectionId, type } = action;

            return {
                ...state,
                sectionResources: [
                    ...state.sections.map(sectionResource => {
                        if (sectionResource.id === sectionId) {
                            return {
                                ...sectionResource,
                                type
                            };
                        }
                        return sectionResource;
                    })
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
