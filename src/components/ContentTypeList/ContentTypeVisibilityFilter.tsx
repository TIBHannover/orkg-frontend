import type { Key } from '@heroui/react';
import { ListBox, Select } from '@heroui/react';
import { useQueryState } from 'nuqs';
import { FC } from 'react';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { VisibilityOptions } from '@/services/backend/types';

const OPTIONS = [
    { id: VISIBILITY_FILTERS.TOP_RECENT, label: 'Top recent' },
    { id: VISIBILITY_FILTERS.ALL_LISTED, label: 'Recently added' },
    { id: VISIBILITY_FILTERS.FEATURED, label: 'Featured' },
    { id: VISIBILITY_FILTERS.UNLISTED, label: 'Unlisted' },
];

type ContentTypeVisibilityFilterProps = {
    isLoading: boolean;
};

const ContentTypeVisibilityFilter: FC<ContentTypeVisibilityFilterProps> = ({ isLoading }) => {
    const [sort, setSort] = useQueryState<VisibilityOptions>('sort', {
        defaultValue: VISIBILITY_FILTERS.TOP_RECENT,
        parse: (value) => value as VisibilityOptions,
    });

    const handleChangeVisibility = (key: Key | null) => {
        if (key) {
            setSort(key as VisibilityOptions, { scroll: false, history: 'push' });
        }
    };

    return (
        <div className="mr-2">
            <Select
                aria-label="Sort by visibility"
                className="w-44"
                isDisabled={isLoading}
                placeholder="Select visibility"
                value={sort}
                onChange={handleChangeVisibility}
            >
                <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {OPTIONS.map((option) => (
                            <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                                {option.label}
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
        </div>
    );
};

export default ContentTypeVisibilityFilter;
