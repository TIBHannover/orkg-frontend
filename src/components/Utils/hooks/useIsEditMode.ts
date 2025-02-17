import useAuthentication from 'components/hooks/useAuthentication';
import { parseAsJson, useQueryState } from 'nuqs';

const useIsEditMode = () => {
    const { status } = useAuthentication();
    const [isEditMode, setIsEditMode] = useQueryState('isEditMode', parseAsJson<boolean>().withDefault(false));

    const toggleIsEditMode = (newValue = undefined) => {
        setIsEditMode(newValue === undefined ? !isEditMode : newValue);
    };

    if (isEditMode) {
        if (status === 'unauthenticated') {
            toggleIsEditMode();
        }
    }

    return { isEditMode, toggleIsEditMode };
};

export default useIsEditMode;
