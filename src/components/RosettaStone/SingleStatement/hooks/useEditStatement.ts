import { OptionType } from 'components/Autocomplete/types';
import useRosettaTemplate from 'components/RosettaStone/SingleStatement/hooks/useRosettaTemplate';
import { getConfigByClassId } from 'constants/DataTypes';
import { ENTITIES } from 'constants/graphSettings';
import { EXTRACTION_METHODS } from 'constants/misc';
import errorHandler from 'helpers/errorHandler';
import { differenceWith, toInteger } from 'lodash';
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createRSStatement, deleteRSStatement, fullyDeleteRSStatement, updateRSStatement } from 'services/backend/rosettaStone';
import { NewLiteral, NewResource, Node, RosettaStoneStatement } from 'services/backend/types';
import { RootStore } from 'slices/types';
import { guid } from 'utils';

type UseEditStatementProps = {
    statement: RosettaStoneStatement;
    setNewStatements?: Dispatch<SetStateAction<RosettaStoneStatement[]>>;
    reloadStatements?: () => void;
};

const useEditStatement = ({ statement, setNewStatements, reloadStatements }: UseEditStatementProps) => {
    const user = useSelector((state: RootStore) => state.auth.user);

    const initialLocalValues = useCallback(() => {
        return {
            '0': statement.subjects,
            ...Object.fromEntries(statement.objects.map((o, i) => [i + 1, o])),
        };
    }, [statement.objects, statement.subjects]);

    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(!statement.latest_version_id);
    // Statements values
    const [localValues, setLocalValues] = useState<{ [key: string]: OptionType[] }>(initialLocalValues());
    // Statement metadata
    const [isNegate, setIsNegate] = useState(statement.negated);
    const [certainty, setCertainty] = useState(statement.certainty);

    // Template
    const { data: template } = useRosettaTemplate({ id: statement.template_id ?? '' });

    useEffect(() => {
        setLocalValues(initialLocalValues());
    }, [initialLocalValues, isEditing]);

    const updateLocalValue = (index: string, value: OptionType[]) => {
        setLocalValues((prev) => ({ ...prev, [index]: value }));
    };

    const isUnchangedValues = (oldValue: OptionType[], newValue: OptionType[]) => {
        return (
            oldValue.length === newValue.length &&
            differenceWith(oldValue, newValue, (objValue, othValue) => objValue?.label === othValue?.label).length === 0
        );
    };

    const handleDeleteStatement = async () => {
        if (statement.latest_version_id) {
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
        const resources: { [key: string]: NewResource } = {};
        const literals: { [key: string]: NewLiteral } = {};
        for (let key = 0; key < template.properties.length; key += 1) {
            if (key.toString() in localValues) {
                const value = localValues[key.toString()];
                let range: Node | undefined;
                const i = toInteger(key);
                const propertyShape = template.properties[i];
                if ('class' in propertyShape && propertyShape.class) {
                    range = propertyShape.class;
                } else if ('datatype' in propertyShape && propertyShape.datatype) {
                    range = propertyShape.datatype;
                }
                if (key === 0) {
                    // subject
                    if (isUnchangedValues(value, statement.subjects)) {
                        subjects = statement.subjects.map((s) => s.id);
                    } else {
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
                            literals[tempID] = { label: v.label, data_type: getConfigByClassId(range?.id ?? '').type };
                        }
                    }
                    objects.push(values);
                } else if (isUnchangedValues(value, statement.objects?.[i - 1] ?? [])) {
                    objects.push((statement.objects?.[i - 1] ?? []).map((s) => s.id));
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
            observatories: user && 'observatory_id' in user && user.observatory_id ? [user.observatory_id] : [],
            organizations: user && 'organization_id' in user && user.organization_id ? [user.organization_id] : [],
            extraction_method: EXTRACTION_METHODS.MANUAL,
        };
        try {
            if (statement.latest_version_id) {
                await updateRSStatement(statement.id, data);
            } else {
                await createRSStatement({ ...data, template_id: template.id, context: statement.context });
                handleDeleteStatement();
            }
            setIsEditing(false);
            reloadStatements?.();
        } catch (e: unknown) {
            errorHandler({ error: e, shouldShowToast: true, fieldLabels: { label: 'Label', example_usage: 'Example sentences' } });
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
