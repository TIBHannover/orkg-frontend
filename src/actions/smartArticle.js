import * as type from 'actions/types';
import { updateResource } from 'services/backend/resources';

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

export const updateAuthors = authorResources => async dispatch => {
    dispatch({
        type: type.ARTICLE_WRITER_UPDATE_AUTHORS,
        authorResources
    });
};
