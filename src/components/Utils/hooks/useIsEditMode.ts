import { parseAsJson, useQueryState } from 'nuqs';
import { useSelector } from 'react-redux';
import { RootStore } from 'slices/types';

const useIsEditMode = () => {
    const { initialized, authenticated } = useSelector((state: RootStore) => state.auth);

    const [isEditMode, setIsEditMode] = useQueryState('isEditMode', parseAsJson<boolean>().withDefault(false));

    const toggleIsEditMode = (newValue = undefined) => {
        setIsEditMode(newValue === undefined ? !isEditMode : newValue);
    };

    if (isEditMode) {
        if (initialized && !authenticated) {
            toggleIsEditMode();
        }
    }

    return { isEditMode, toggleIsEditMode };
};

export default useIsEditMode;
