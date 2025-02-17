import useMembership from 'components/hooks/useMembership';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { CLASSES } from 'constants/graphSettings';
import errorHandler from 'helpers/errorHandler';
import { toast } from 'react-toastify';
import { createRSTemplate, rosettaStoneUrl, updateRSTemplate } from 'services/backend/rosettaStone';
import { mutate } from 'swr';

const useSaveStatementType = () => {
    const { id, examples, label, description, properties } = useRosettaTemplateEditorState();

    const { organizationId, observatoryId } = useMembership();

    const dispatch = useRosettaTemplateEditorDispatch();

    const getFormattedLabel = () => {
        let finalFormattedLabel = '';
        properties.forEach((property, index) => {
            if (index === 1) {
                finalFormattedLabel += `[${property.placeholder}]`;
            } else {
                finalFormattedLabel += `[${property.preposition ? `${property.preposition}` : ''} {${index === 0 ? index : index - 1}} ${
                    property.postposition ? `${property.postposition}` : ''
                }]`;
            }
        });
        return finalFormattedLabel;
    };

    const handleSaveStatementType = async (): Promise<string | undefined> => {
        dispatch({ type: 'setIsSaving', payload: true });
        try {
            const data = {
                label,
                description,
                example_usage: examples,
                formatted_label: getFormattedLabel(),
                properties: properties
                    // ignore verb
                    .filter((p, index) => index !== 1)
                    .map((p, index) => ({
                        description: p.description,
                        label: p.placeholder ?? 'Object',
                        max_count: p.max_count !== '*' ? p.max_count : undefined,
                        // subject position cardinality. Minimum cardinality must be at least one.
                        min_count: index === 0 && !p.min_count ? 1 : p.min_count,
                        path: index === 0 ? 'hasSubjectPosition' : 'hasObjectPosition',
                        placeholder: p.placeholder,
                        ...('datatype' in p && p.datatype?.id && { datatype: p.datatype?.id }),
                        ...('pattern' in p && 'datatype' in p && p.datatype?.id === CLASSES.STRING && { pattern: p.pattern }),
                        ...('datatype' in p &&
                            'max_inclusive' in p &&
                            [CLASSES.INTEGER, CLASSES.DECIMAL].includes(p.datatype?.id ?? '') && {
                                max_inclusive: p.max_inclusive,
                                min_inclusive: p.min_inclusive,
                            }),
                        ...('class' in p && p.class?.id && { class: p.class?.id }),
                    })),
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
            };
            const savedTemplate = await (id ? updateRSTemplate(id, data) : createRSTemplate(data));
            if (id) {
                // revalidate cache
                mutate([id, rosettaStoneUrl, 'getRSTemplate']);
            }
            toast.success(`Template ${id ? 'updated' : 'created'} successfully`);
            return savedTemplate;
        } catch (e: unknown) {
            errorHandler({ error: e, shouldShowToast: true, fieldLabels: { label: 'Label', example_usage: 'Example sentences' } });
        } finally {
            dispatch({ type: 'setIsSaving', payload: false });
        }
        return undefined;
    };

    return {
        handleSaveStatementType,
    };
};

export default useSaveStatementType;
