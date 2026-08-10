import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import { FC } from 'react';

import usePublishedFilter, { PublishedStatus } from '@/components/PublishedStatusFilter/hooks/usePublishedFilter';

const PUBLISHED_STATUS_LABELS: Record<PublishedStatus, string> = {
    unpublished: 'Unpublished',
    published: 'Published',
    all: 'All',
};

const PublishedStatusFilter: FC = () => {
    const { publishedStatus, setPublishedStatus } = usePublishedFilter();

    return (
        <Dropdown>
            <Button size="sm" className="button--orkg-secondary">
                {PUBLISHED_STATUS_LABELS[publishedStatus]}
                <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
            </Button>
            <Dropdown.Popover>
                <Dropdown.Menu
                    selectionMode="single"
                    selectedKeys={new Set([publishedStatus])}
                    onAction={(key) => setPublishedStatus(key as PublishedStatus, { scroll: false, history: 'push' })}
                >
                    <Dropdown.Item id="unpublished" textValue="Unpublished">
                        Unpublished
                    </Dropdown.Item>
                    <Dropdown.Item id="published" textValue="Published">
                        Published
                    </Dropdown.Item>
                    <Dropdown.Item id="all" textValue="All">
                        All
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default PublishedStatusFilter;
