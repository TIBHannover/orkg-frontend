import AutoComplete from 'components/Autocomplete/Autocomplete';
import { useEffect, useState } from 'react';
import { getEntity } from 'services/backend/misc';
import { Node } from 'services/backend/types';

const AutocompleteStringDefaultValue = ({ entityType, defaultValue, ...props }: { entityType: string; defaultValue: string | undefined } & any) => {
    const [value, setValue] = useState<Node | null>(null);
    useEffect(() => {
        const loadNode = async () => {
            if (defaultValue) {
                const node = await getEntity(entityType, defaultValue);
                setValue(node);
            } else {
                setValue(null);
            }
        };
        loadNode();
    }, [defaultValue, entityType]);

    return <AutoComplete {...props} value={value} entityType={entityType} />;
};

export default AutocompleteStringDefaultValue;
