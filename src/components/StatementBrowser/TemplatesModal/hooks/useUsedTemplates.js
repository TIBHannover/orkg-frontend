import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDeepCompareEffect } from 'react-use';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';

const useUsedTemplates = ({ resourceId = null, resourceObject = null }) => {
    const [usedTemplates, setUsedTemplates] = useState([]);
    const [isLoadingUsedTemplates, setIsLoadingUsedTemplates] = useState(false);
    const resource = useSelector((state) => (resourceId && state.statementBrowser.resources.byId[resourceId]) || resourceObject);
    const pageSize = 25;

    /**
     * Fetch the templates of a resource
     *
     * @param {String} rId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = useCallback(
        (rId, predicateId, p = null) =>
            getStatementsByObjectAndPredicate({
                objectId: rId,
                predicateId,
                page: p !== null ? p : 0,
                size: pageSize,
                sortBy: 'created_at',
                desc: true,
                returnContent: false,
            }).then(
                (statements) =>
                    // Filter statement with subjects of type Template
                    ({
                        ...statements,
                        content: statements.content
                            .filter((statement) => statement.subject.classes.includes(CLASSES.NODE_SHAPE))
                            .map((st) => ({ id: st.subject.id, label: st.subject.label })),
                    }), // return the template Object
            ),
        [],
    );

    useDeepCompareEffect(() => {
        setIsLoadingUsedTemplates(true);
        const apiCalls = resource?.classes?.map((c) => getTemplatesOfResourceId(c, PREDICATES.SHACL_TARGET_CLASS, 0));
        Promise.all(apiCalls)
            .then((tmpl) => {
                setUsedTemplates(
                    tmpl
                        .map((c, index) => c.content.map((t) => ({ ...t, classId: resource?.classes[index] })))
                        .filter((r) => r.length)
                        .flat(),
                );
                setIsLoadingUsedTemplates(false);
            })
            .catch(() => {
                setUsedTemplates([]);
                setIsLoadingUsedTemplates(false);
            });
    }, [getTemplatesOfResourceId, resource?.classes]);

    return {
        usedTemplates,
        isLoadingUsedTemplates,
    };
};

export default useUsedTemplates;
