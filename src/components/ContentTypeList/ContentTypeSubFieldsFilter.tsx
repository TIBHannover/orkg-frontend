import { Checkbox } from '@heroui/react';
import { useQueryState } from 'nuqs';
import { FC } from 'react';

type ContentTypeSubFieldsFilterProps = {
    isLoading: boolean;
};

const ContentTypeSubFieldsFilter: FC<ContentTypeSubFieldsFilterProps> = ({ isLoading }) => {
    const [includeSubFields, setIncludeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const handleChangeIncludeSubFields = (isSelected: boolean) => {
        setIncludeSubFields(isSelected, { scroll: false, history: 'push' });
    };

    return (
        <div className="flex justify-end items-center mr-2">
            <Checkbox
                name="include_subfields"
                isSelected={includeSubFields}
                onChange={handleChangeIncludeSubFields}
                isDisabled={isLoading}
                className="text-sm"
            >
                <Checkbox.Content>
                    <Checkbox.Control>
                        <Checkbox.Indicator />
                    </Checkbox.Control>
                    Include subfields
                </Checkbox.Content>
            </Checkbox>
        </div>
    );
};

export default ContentTypeSubFieldsFilter;
