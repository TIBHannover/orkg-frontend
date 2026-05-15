import { Label, ListBox, Select } from '@heroui/react';
import dayjs from 'dayjs';
import { range } from 'lodash';

type PublicationYearInputProps = {
    value?: string;
    onChange: (value: string) => void;
    inputId?: string;
    isDisabled?: boolean;
};

const PublicationYearInput = ({ value = '', onChange, inputId, isDisabled = false }: PublicationYearInputProps) => {
    const years = range(1900, dayjs().year() + 1).reverse();

    return (
        <Select
            fullWidth
            placeholder="Year"
            value={value || null}
            isDisabled={isDisabled}
            onChange={(selected) => onChange(selected ? String(selected) : '')}
        >
            {inputId && (
                <Label htmlFor={inputId} className="sr-only">
                    Publication year
                </Label>
            )}
            <Select.Trigger id={inputId}>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover className="max-h-64 overflow-auto">
                <ListBox>
                    {years.map((year) => (
                        <ListBox.Item key={year} id={String(year)} textValue={String(year)}>
                            {year}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
        </Select>
    );
};

export default PublicationYearInput;
