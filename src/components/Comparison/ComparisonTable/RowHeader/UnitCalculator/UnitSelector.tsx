'use client';

import { ComboBox, Input, ListBox } from '@heroui/react';
import { type Key, useState } from 'react';

import { QuantityUnitItem } from '@/services/qudt/types';

export type UnitSelectorOption = Required<Pick<QuantityUnitItem, 'label'>> & QuantityUnitItem;

const optionKey = (o: Pick<QuantityUnitItem, 'id' | 'label'>) => `${o.id}|${o.label ?? ''}`;

type UnitSelectorProps = {
    options: UnitSelectorOption[];
    selectedUnit: QuantityUnitItem | null;
    onChange: (unit: QuantityUnitItem | null) => void;
    disabled?: boolean;
};

export default function UnitSelector({ options, selectedUnit, onChange, disabled = false }: UnitSelectorProps) {
    const [inputValue, setInputValue] = useState(() => {
        const match = options.find((option) => option.id === selectedUnit?.id);
        return match?.label ?? '';
    });

    const [prevSelectedUnit, setPrevSelectedUnit] = useState(selectedUnit);
    if (prevSelectedUnit !== selectedUnit) {
        setPrevSelectedUnit(selectedUnit);
        if (selectedUnit) {
            const match = options.find((option) => option.id === selectedUnit.id);
            setInputValue(match?.label ?? selectedUnit.label ?? '');
        } else {
            setInputValue('');
        }
    }

    const filteredItems = (() => {
        if (!inputValue) return options;
        const searchStr = inputValue.toLowerCase();
        return options.filter((item) => item.label.toLowerCase().includes(searchStr) || item.ucum?.toLowerCase().includes(searchStr));
    })();

    const handleSelectionChange = (key: Key | null) => {
        if (key === null) {
            setInputValue('');
            onChange(null);
            return;
        }
        const found = options.find((item) => optionKey(item) === String(key)) ?? null;
        setInputValue(found?.label ?? '');
        onChange(found);
    };

    return (
        <ComboBox
            className="grow"
            items={filteredItems}
            inputValue={inputValue}
            onInputChange={setInputValue}
            value={selectedUnit ? optionKey(selectedUnit) : null}
            onChange={handleSelectionChange}
            isDisabled={disabled}
            menuTrigger="focus"
            allowsEmptyCollection
            aria-label="Select a Unit"
        >
            <ComboBox.InputGroup>
                <Input placeholder="Select a Unit" />
                <ComboBox.Trigger />
            </ComboBox.InputGroup>

            <ComboBox.Popover placement="bottom" className="rounded-md shadow-md">
                <ListBox className="max-h-60 overflow-y-auto p-1">
                    {(item: UnitSelectorOption) => (
                        <ListBox.Item id={optionKey(item)} textValue={item.label}>
                            {item.label}
                        </ListBox.Item>
                    )}
                </ListBox>
            </ComboBox.Popover>
        </ComboBox>
    );
}
