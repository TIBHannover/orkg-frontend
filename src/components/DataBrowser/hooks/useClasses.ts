import useEntity from 'components/DataBrowser/hooks/useEntity';
import { classesUrl, getClassById } from 'services/backend/classes';
import useSWR from 'swr';

const useClasses = () => {
    const { entity } = useEntity();

    const { data: classes, isLoading } = useSWR(
        entity && 'classes' in entity && entity.classes.length > 0 ? [entity.classes, classesUrl, 'getClassById'] : null,
        ([params]) => Promise.all(params.map((id) => getClassById(id))),
    );

    return { isLoading, classes: classes ?? [] };
};

export default useClasses;
