import { useSearchParams } from 'react-router-dom';

const useIsEditMode = () => {
    const [searchParams, setSearchParams] = useSearchParams({});
    const isEditMode = searchParams.get('isEditMode') === 'true';

    const toggleIsEditMode = () => {
        searchParams.set('isEditMode', !isEditMode);
        // from react-router@6.4 we can use searchParams from the function argument: https://stackoverflow.com/a/70330406
        setSearchParams(searchParams);
    };
    return { isEditMode, toggleIsEditMode };
};

export default useIsEditMode;
