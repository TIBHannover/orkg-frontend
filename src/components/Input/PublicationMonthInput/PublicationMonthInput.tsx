import { Label, ListBox, Select } from '@heroui/react';
import dayjs from 'dayjs';

type PublicationMonthInputProps = {
    value?: string;
    onChange: (value: string) => void;
    inputId?: string;
    isDisabled?: boolean;
};

const PublicationMonthInput = ({ value = '', onChange, inputId, isDisabled = false }: PublicationMonthInputProps) => (
    <Select
        fullWidth
        placeholder="Month"
        value={value || null}
        isDisabled={isDisabled}
        onChange={(selected) => onChange(selected ? String(selected) : '')}
    >
        {inputId && (
            <Label htmlFor={inputId} className="sr-only">
                Publication month
            </Label>
        )}
        <Select.Trigger id={inputId}>
            <Select.Value />
            <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
            <ListBox>
                {dayjs.months().map((month, index) => (
                    <ListBox.Item key={index + 1} id={String(index + 1)} textValue={month}>
                        {month}
                        <ListBox.ItemIndicator />
                    </ListBox.Item>
                ))}
            </ListBox>
        </Select.Popover>
    </Select>
);

export default PublicationMonthInput;
