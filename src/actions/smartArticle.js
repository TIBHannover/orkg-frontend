import * as type from 'actions/types';
import { updateLiteral } from 'services/backend/literals';
import { updateResource, updateResourceClasses } from 'services/backend/resources';
import { CLASSES } from 'constants/graphSettings';

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

export const updateSectionTitle = ({ id, title }) => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_SECTION_TITLE,
        payload: {
            title,
            id
        }
    });
    dispatch(setIsLoading(true));
    await updateResource(id, title);
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

export const updateSectionType = ({ id, type: sectionType }) => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_SECTION_TYPE,
        payload: {
            sectionType,
            id
        }
    });
    dispatch(setIsLoading(true));
    await updateResourceClasses(id, [CLASSES.SECTION, sectionType]);
    dispatch(setIsLoading(false));
};

export const updateAuthors = authorResources => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_AUTHORS,
        authorResources
    });
};

export const createSection = afterIndex => async dispatch => {
    /*dispatch({
        type: type.ARTICLE_WRITER_UPDATE_AUTHORS,
        authorResources
    });*/
};
