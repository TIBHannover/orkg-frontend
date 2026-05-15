import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Dropdown, Label, ListBox, Popover, Select } from '@heroui/react';
import { FC } from 'react';

import { RESOURCES } from '@/constants/graphSettings';
import { stringifySort } from '@/utils';

type ContributorsDropdownFilterProps = {
    sort: string;
    isLoading: boolean;
    includeSubFields: boolean;
    setSort: (sort: string) => void;
    setIncludeSubFields: (includeSubFields: boolean) => void;
    researchFieldId: string;
};

const ContributorsDropdownFilter: FC<ContributorsDropdownFilterProps> = ({
    sort,
    isLoading,
    includeSubFields,
    setSort,
    setIncludeSubFields,
    researchFieldId = RESOURCES.RESEARCH_FIELD_MAIN,
}) => {
    if (researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN) {
        return (
            <Dropdown>
                <Button size="sm" variant="ghost" className="px-4">
                    {stringifySort(sort)}
                    <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
                </Button>
                <Dropdown.Popover>
                    <Dropdown.Menu onAction={(key) => setSort(key as string)}>
                        <Dropdown.Item id="top" textValue="Last 30 days" isDisabled={isLoading}>
                            Last 30 days
                        </Dropdown.Item>
                        <Dropdown.Item id="all" textValue="All time" isDisabled={isLoading}>
                            All time
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
        );
    }

    return (
        <Popover>
            <Button size="sm" variant="ghost" className="shrink-0 px-4 ml-auto">
                {stringifySort(sort)} <FontAwesomeIcon icon={faChevronDown} />
            </Button>
            <Popover.Content placement="bottom end">
                <Popover.Dialog className="w-64 p-4">
                    <Select
                        aria-label="Sort"
                        value={sort}
                        onChange={(key) => setSort(key as string)}
                        isDisabled={isLoading}
                        className="flex flex-col gap-1"
                    >
                        <Label className="text-sm">Sort</Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                <ListBox.Item id="top" textValue="Last 30 days">
                                    Last 30 days
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                                <ListBox.Item id="all" textValue="All time">
                                    All time
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            </ListBox>
                        </Select.Popover>
                    </Select>
                    <Checkbox
                        isSelected={includeSubFields}
                        onChange={(isSelected) => setIncludeSubFields(isSelected)}
                        isDisabled={isLoading}
                        className="mt-3"
                    >
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content>Include subfields</Checkbox.Content>
                    </Checkbox>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
};

export default ContributorsDropdownFilter;
