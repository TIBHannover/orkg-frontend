import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import { useQueryState } from 'nuqs';
import { FC } from 'react';

import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { VisibilityOptions } from '@/services/backend/types';

type VisibilityFilterProps = {
    defaultValue?: VisibilityOptions;
};

const VISIBILITY_LABELS: Partial<Record<VisibilityOptions, string>> = {
    [VISIBILITY_FILTERS.ALL_LISTED]: 'Recently added',
    [VISIBILITY_FILTERS.FEATURED]: 'Featured',
    [VISIBILITY_FILTERS.UNLISTED]: 'Unlisted',
};

const VisibilityFilter: FC<VisibilityFilterProps> = ({ defaultValue = VISIBILITY_FILTERS.ALL_LISTED }) => {
    const [visibility, setVisibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue,
        parse: (value) => value as VisibilityOptions,
    });

    return (
        <Dropdown>
            <Button size="sm" className="button--orkg-secondary">
                {VISIBILITY_LABELS[visibility]}
                <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
            </Button>
            <Dropdown.Popover>
                <Dropdown.Menu
                    selectionMode="single"
                    selectedKeys={new Set([visibility])}
                    onAction={(key) => setVisibility(key as VisibilityOptions)}
                >
                    <Dropdown.Item id={VISIBILITY_FILTERS.ALL_LISTED} textValue="Recently added">
                        Recently added
                    </Dropdown.Item>
                    <Dropdown.Item id={VISIBILITY_FILTERS.FEATURED} textValue="Featured">
                        Featured
                    </Dropdown.Item>
                    <Dropdown.Item id={VISIBILITY_FILTERS.UNLISTED} textValue="Unlisted">
                        Unlisted
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default VisibilityFilter;
