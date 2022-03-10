import { CLASSES, PREDICATES, ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import { isEqual, cloneDeep } from 'lodash';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getClassById } from 'services/backend/classes';
import { createLiteral as createLiteralApi, updateLiteral } from 'services/backend/literals';
import { markAsUnverified, markAsVerified } from 'services/backend/papers';
import { createResource, getResource, updateResource } from 'services/backend/resources';
import Confirm from 'components/ConfirmationModal/ConfirmationModal';
import {
    createLiteralStatement,
    createResourceStatement,
    deleteStatementById,
    deleteStatementsByIds,
    getStatementsByPredicateAndLiteral,
    getStatementsBySubject,
    updateStatement
} from 'services/backend/statements';
import { getIsVerified } from 'services/backend/papers';

const useEditResource = resource => {
    const user = useSelector(state => state.auth.user);
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

    const updateOrCreateLiteral = async ({ id = null, label, predicateId, paperId }) => {
        if (id) {
            updateLiteral(id, label);
            return {
                id,
                label
            };
        } else if (label) {
            const newLiteral = await createLiteralApi(label);
            createLiteralStatement(paperId, predicateId, newLiteral.id);
            return {
                id: newLiteral.id,
                label
            };
        }
        return null;
    };

    return { classes, label, isLoading, setIsLoading, handleChangeClasses, setLabel };
};

export default useEditResource;
