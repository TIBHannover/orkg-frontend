import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { firstLoad, openAuthDialog } from 'slices/authSlice';

const useIsEditMode = () => {
    const { dialogIsOpen, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // using a rather complex method to set the search params: https://github.com/vercel/next.js/discussions/47583]
    // since useSearchParams is read-only

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    let isEditMode = searchParams.get('isEditMode') === 'true';

    const toggleIsEditMode = (newValue = undefined) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('isEditMode', newValue === undefined ? !isEditMode : newValue);
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
            if (!dialogIsOpen) {
                dispatch(openAuthDialog({ action: 'signin', signInRequired: true }));
            }
        }
    }

    return { isEditMode, toggleIsEditMode };
};

export default useIsEditMode;
