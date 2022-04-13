import { useState, useEffect } from 'react';
import { getClassById } from 'services/backend/classes';
import Confirm from 'components/ConfirmationModal/ConfirmationModal';

const useEditResource = resource => {
    const [isLoading, setIsLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [label, setLabel] = useState(resource.label);

    useEffect(() => {
        let isMounted = true;
        const findClasses = async () => {
            setIsLoading(true);
            const classesCalls = resource.classes?.map(c => getClassById(c)) ?? [];
            await Promise.all(classesCalls)
                .then(res_classes => {
                    if (isMounted) {
                        setIsLoading(false);
                        setClasses(res_classes ?? []);
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        setClasses([]);
                        setIsLoading(false);
                        console.error(err);
                    }
                });
        };

        findClasses();

        return () => {
            isMounted = false;
        };
    }, [resource?._class, resource.classes]);

    const handleChangeClasses = async (selected, action) => {
        if (action.action === 'create-option') {
            const foundIndex = selected.findIndex(x => x.__isNew__);
            const newClass = await Confirm({
                label: selected[foundIndex].label
            });
            if (newClass) {
                const foundIndex = selected.findIndex(x => x.__isNew__);
                selected[foundIndex] = newClass;
            } else {
                return null;
            }
        }
        const newClasses = !selected ? [] : selected;
        setClasses(newClasses);
    };

    return { classes, label, isLoading, setIsLoading, handleChangeClasses, setLabel };
};

export default useEditResource;
