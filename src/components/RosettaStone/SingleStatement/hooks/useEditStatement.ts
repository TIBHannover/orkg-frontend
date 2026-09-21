import { CreateLiteralRequestPart, CreateResourceRequestPart } from '@orkg/orkg-client';
import { differenceWith, toInteger } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { OptionType } from '@/components/Autocomplete/types';
import useMembership from '@/components/hooks/useMembership';
import useRosettaTemplate from '@/components/RosettaStone/SingleStatement/hooks/useRosettaTemplate';
import { getConfigByClassId } from '@/constants/DataTypes';
import { ENTITIES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import errorHandler from '@/helpers/errorHandler';
import { createRSStatement, deleteRSStatement, fullyDeleteRSStatement, updateRSStatement } from '@/services/backend/rosettaStone';
import { Node, RosettaStoneStatement, ThingReference } from '@/services/backend/types';
import { guid } from '@/utils';

type UseEditStatementProps = {
    statement: RosettaStoneStatement;
    setNewStatements?: Dispatch<SetStateAction<RosettaStoneStatement[]>>;
    reloadStatements?: () => void;
};

const useEditStatement = ({ statement, setNewStatements, reloadStatements }: UseEditStatementProps) => {
    const { organizationId, observatoryId } = useMembership();

    const initialLocalValues = useCallback(() => {
        return {
            '0': statement.subjects as unknown as OptionType[],
            ...Object.fromEntries(statement.objects.map((o, i) => [i + 1, o])),
        };
    }, [statement.objects, statement.subjects]);

    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(!statement.latestVersionId);
    // Statements values
    const [localValues, setLocalValues] = useState<{ [key: string]: OptionType[] }>(initialLocalValues());
    // Statement metadata
    const [isNegate, setIsNegate] = useState(statement.negated);
    const [certainty, setCertainty] = useState(statement.certainty);

    // Template
    const { data: template } = useRosettaTemplate({ id: statement.templateId ?? '' });

    useEffect(() => {
        setLocalValues(initialLocalValues());
    }, [initialLocalValues, isEditing]);

    const updateLocalValue = (index: string, value: OptionType[]) => {
        setLocalValues((prev) => ({ ...prev, [index]: value }));
    };

    const isUnchangedValues = (oldValue: OptionType[], newValue: ThingReference[]) => {
        return (
            oldValue.length === newValue.length &&
            differenceWith(oldValue, newValue, (objValue, othValue) => objValue?.label === othValue?.label).length === 0
        );
    };

    const handleDeleteStatement = async () => {
        if (statement.latestVersionId) {
            await deleteRSStatement(statement.id);
            reloadStatements?.();
        } else if (setNewStatements) {
            setNewStatements((prev) => prev.filter((s) => s.id !== statement.id));
        }
    };

    const handleDeleteStatementPermanently = async () => {
        await fullyDeleteRSStatement(statement.id);
        reloadStatements?.();
    };

    const onSave = async () => {
        if (!template || !template.properties) {
            return;
        }
        setIsSaving(true);
        let subjects: string[] = [];
        const objects: string[][] = [];
        const lists = {};
        const classes = {};
        const resources: { [key: string]: CreateResourceRequestPart } = {};
        const literals: { [key: string]: CreateLiteralRequestPart } = {};
        for (let key = 0; key < template.properties.length; key += 1) {
            if (key.toString() in localValues) {
                const value = localValues[key.toString()];
                let range: Node | undefined;
                const i = toInteger(key);
                const propertyShape = template.properties[i];
                // the generated client escapes the wire field 'class' as '_class'
                if ('_class' in propertyShape && propertyShape._class) {
                    range = propertyShape._class;
                } else if ('datatype' in propertyShape && propertyShape.datatype) {
                    range = propertyShape.datatype;
                }
                if (key === 0) {
                    // subject
                    if (isUnchangedValues(value, statement.subjects)) {
                        subjects = statement.subjects.map((s) => s.id).filter((id) => id !== undefined);
                    } else {
                        const values: string[] = [];
                        for (const v of value) {
                            if (v.__isNew__) {
                                const tempID = `#${guid()}`;
                                values.push(tempID);
                                let _classes = v.classes ? v.classes : [];
                                if (range?.id && _classes.length === 0) {
                                    _classes = range?.id ? [range.id] : [];
                                }
                                resources[tempID] = { label: v.label, classes: _classes };
                            } else {
                                values.push(v.id);
                            }
                        }
                        subjects = values;
                    }
                } else if (getConfigByClassId(range?.id ?? '')._class === ENTITIES.LITERAL) {
                    // Literal
                    // Literal are always recreated because the id is not returned by the api
                    const values: string[] = [];
                    for (const v of value) {
                        if (v.label) {
                            // the label should not be empty
                            const tempID = `#${guid()}`;
                            values.push(tempID);
                            literals[tempID] = { label: v.label, dataType: getConfigByClassId(range?.id ?? '').type };
                        }
                    }
                    objects.push(values);
                } else if (isUnchangedValues(value, statement.objects?.[i - 1] ?? [])) {
                    objects.push((statement.objects?.[i - 1] ?? []).map((s) => s.id).filter((id) => id !== undefined));
                } else {
                    // Resource
                    const values: string[] = [];
                    for (const v of value) {
                        if (v.__isNew__) {
                            const tempID = `#${guid()}`;
                            values.push(tempID);
                            resources[tempID] = { label: v.label, classes: range?.id ? [range.id] : [] };
                        } else {
                            values.push(v.id);
                        }
                    }
                    objects.push(values);
                }
            } else if (key !== 0) {
                objects.push([]);
            }
        }

        const data = {
            subjects,
            objects,
            resources,
            literals,
            lists,
            classes,
            negated: isNegate,
            certainty,
            observatories: observatoryId ? [observatoryId] : [],
            organizations: organizationId ? [organizationId] : [],
            extractionMethod: EXTRACTION_METHODS.MANUAL,
        };
        try {
            if (statement.latestVersionId) {
                await updateRSStatement(statement.id, data);
            } else {
                await createRSStatement({ ...data, templateId: template.id, context: statement.context });
                handleDeleteStatement();
            }
            setIsEditing(false);
            reloadStatements?.();
        } catch (e: unknown) {
            await errorHandler({ error: e, shouldShowToast: true, fieldLabels: { label: 'Label', example_usage: 'Example sentences' } });
        } finally {
            setIsSaving(false);
        }
    };

    return {
        onSave,
        isSaving,
        isNegate,
        certainty,
        setIsNegate,
        setCertainty,
        localValues,
        updateLocalValue,
        isEditing,
        setIsEditing,
        handleDeleteStatement,
        handleDeleteStatementPermanently,
    };
};

export default useEditStatement;
