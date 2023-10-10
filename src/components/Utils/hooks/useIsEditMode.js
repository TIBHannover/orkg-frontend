import usePathname from 'components/NextJsMigration/usePathname';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { firstLoad, openAuthDialog } from 'slices/authSlice';

const useIsEditMode = () => {
    const [openedAuthDialog, setOpenedAuthDialog] = useState(false);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    // using a rather complex method to set the search params: https://github.com/vercel/next.js/discussions/47583]
    // since useSearchParams is read-only

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    let isEditMode = searchParams.get('isEditMode') === 'true';

    const toggleIsEditMode = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('isEditMode', !isEditMode);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.push(`${pathname}${query}`);
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
