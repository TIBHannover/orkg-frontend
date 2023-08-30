import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { firstLoad, openAuthDialog } from 'slices/authSlice';

const useIsEditMode = () => {
    const [searchParams, setSearchParams] = useSearchParams({});
    let isEditMode = searchParams.get('isEditMode') === 'true';
    const [openedAuthDialog, setOpenedAuthDialog] = useState(false);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    const toggleIsEditMode = () => {
        searchParams.set('isEditMode', !isEditMode);
        // from react-router@6.4 we can use searchParams from the function argument: https://stackoverflow.com/a/70330406
        setSearchParams(searchParams);
    };

    if (isEditMode) {
        if (user === 0) {
            isEditMode = false;
            dispatch(firstLoad());
        } else if (user === null) {
            isEditMode = false;
            if (!openedAuthDialog) {
                dispatch(openAuthDialog({ action: 'signin', signInRequired: true }));
                setOpenedAuthDialog(true);
            }
        }
    }

    return { isEditMode, toggleIsEditMode };
};

export default useIsEditMode;
