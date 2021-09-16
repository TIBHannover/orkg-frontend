import { useState, useCallback } from 'react';
import { selectResource, fetchStatementsForResource, generatedFormattedLabel } from 'actions/statementBrowser';
import { uniq } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';

const useValueItem = ({ valueId, propertyId }) => {
    const dispatch = useDispatch();

    const value = useSelector(state => state.statementBrowser.values.byId[valueId]);
    const property = useSelector(state => state.statementBrowser.properties.byId[propertyId]);
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);

    const [modal, setModal] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const { hasLabelFormat, labelFormat } = useSelector(state => {
        // get all template ids
        let templateIds = [];
        const filter_classes = value?.classes?.filter(c => c) ?? [];
        for (const c of filter_classes) {
            if (state.statementBrowser?.classes?.[c]) {
                templateIds = templateIds.concat(state.statementBrowser?.classes[c]?.templateIds);
            }
        }
        templateIds = uniq(templateIds);
        // check if it formatted label
        let hasLabelFormat = false;
        let labelFormat = '';
        for (const templateId of templateIds) {
            const template = state.statementBrowser.templates[templateId];
            if (template && template.hasLabelFormat) {
                hasLabelFormat = true;
                labelFormat = template.labelFormat;
            }
        }
        return { hasLabelFormat, labelFormat };
    });

    const handleResourceClick = async e => {
        const existingResourceId = resource.existingResourceId;

        if (existingResourceId) {
            dispatch(
                fetchStatementsForResource({
                    resourceId: existingResourceId,
                    depth: 3
                })
            );
        }

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: value.resourceId,
                label: value.label,
                propertyLabel: property?.label
            })
        );
    };

    const handleExistingResourceClick = async () => {
        const existingResourceId = resource.existingResourceId ? resource.existingResourceId : value.resourceId;

        // Load template of this class
        //show the statement browser
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
        setModal(true);
    };

    const getLabel = useCallback(() => {
        const existingResourceId = resource ? resource.existingResourceId : false;
        if (value.classes) {
            if (!hasLabelFormat) {
                return value.label;
            }
            if (existingResourceId && !resource.isFetched && !resource.isFetching && value?._class !== ENTITIES.LITERAL) {
                return dispatch(
                    fetchStatementsForResource({
                        resourceId: existingResourceId
                    })
                ).then(() => {
                    return dispatch(generatedFormattedLabel(resource, labelFormat));
                });
                //return dispatch(generatedFormattedLabel(resource, labelFormat));
            } else {
                return dispatch(generatedFormattedLabel(resource, labelFormat));
            }
        } else {
            return value.label;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource, hasLabelFormat, labelFormat]);

    return {
        resource,
        value,
        modal,
        setModal,
        dialogResourceId,
        dialogResourceLabel,
        openExistingResourcesInDialog,
        handleExistingResourceClick,
        handleResourceClick,
        getLabel
    };
};

export default useValueItem;
