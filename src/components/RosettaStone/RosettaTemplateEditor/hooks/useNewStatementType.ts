import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { CLASSES } from 'constants/graphSettings';
import errorHandler from 'helpers/errorHandler';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createTemplate } from 'services/backend/rosettaStone';
import { RootStore } from 'slices/types';

function useNewStatementType() {
    const { examples, label, description, properties } = useRosettaTemplateEditorState();

    const user = useSelector((state: RootStore) => state.auth.user);

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

    const handleAddStatementType = async (): Promise<string | undefined> => {
        dispatch({ type: 'setIsSaving', payload: true });

        try {
            const savedTemplate = await createTemplate({
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
                observatories: user && 'observatory_id' in user && user.observatory_id ? [user.observatory_id] : [],
                organizations: user && 'organization_id' in user && user.organization_id ? [user.organization_id] : [],
            });
            toast.success('Template created successfully');
            return savedTemplate;
        } catch (e: unknown) {
            errorHandler({ error: e, shouldShowToast: true, fieldLabels: { label: 'Label', example_usage: 'Example sentences' } });
        } finally {
            dispatch({ type: 'setIsSaving', payload: false });
        }
        return undefined;
    };

    return {
        handleAddStatementType,
    };
}

export default useNewStatementType;
