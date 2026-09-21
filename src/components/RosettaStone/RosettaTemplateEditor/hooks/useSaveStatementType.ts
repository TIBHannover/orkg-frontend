import { toast } from '@heroui/react';
import { mutate } from 'swr';

import useMembership from '@/components/hooks/useMembership';
import {
    useRosettaTemplateEditorDispatch,
    useRosettaTemplateEditorState,
} from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import { CLASSES } from '@/constants/graphSettings';
import errorHandler from '@/helpers/errorHandler';
import { createRSTemplate, rosettaStoneUrl, updateRSTemplate } from '@/services/backend/rosettaStone';

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
                exampleUsage: examples,
                formattedLabel: getFormattedLabel(),
                properties: properties
                    // ignore verb
                    .filter((p, index) => index !== 1)
                    .map((p, index) => ({
                        description: p.description,
                        label: p.placeholder ?? 'Object',
                        maxCount: p.max_count !== '*' ? p.max_count : undefined,
                        // subject position cardinality. Minimum cardinality must be at least one.
                        minCount: index === 0 && !p.min_count ? 1 : p.min_count,
                        path: index === 0 ? 'hasSubjectPosition' : 'hasObjectPosition',
                        placeholder: p.placeholder,
                        ...('datatype' in p && p.datatype?.id && { datatype: p.datatype?.id }),
                        ...('pattern' in p && 'datatype' in p && p.datatype?.id === CLASSES.STRING && { pattern: p.pattern }),
                        ...('datatype' in p &&
                            'max_inclusive' in p &&
                            [CLASSES.INTEGER, CLASSES.DECIMAL].includes(p.datatype?.id ?? '') && {
                                maxInclusive: p.max_inclusive,
                                minInclusive: p.min_inclusive,
                            }),
                        // the generated client escapes the wire field 'class' as '_class'
                        ...('class' in p && p.class?.id && { _class: p.class?.id }),
                    })),
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
            };
            let savedTemplate: string | undefined;
            if (id) {
                await updateRSTemplate(id, data);
                savedTemplate = id;
            } else {
                savedTemplate = await createRSTemplate(data);
            }
            if (id) {
                // revalidate cache
                mutate([id, rosettaStoneUrl, 'getRSTemplate']);
            }
            toast.success(`Template ${id ? 'updated' : 'created'} successfully`);
            return savedTemplate;
        } catch (e: unknown) {
            await errorHandler({ error: e, shouldShowToast: true, fieldLabels: { label: 'Label', example_usage: 'Example sentences' } });
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
