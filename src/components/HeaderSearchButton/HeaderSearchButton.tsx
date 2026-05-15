import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, SearchField } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type HeaderSearchButtonProps = {
    placeholder?: string;
    type?: string;
    userId?: string;
};

const HeaderSearchButton = ({ placeholder = '', type, userId }: HeaderSearchButtonProps) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [value, setValue] = useState('');
    const router = useRouter();

    const goToResults = (submittedValue: string) => {
        router.push(`${reverse(ROUTES.SEARCH)}?q=${encodeURIComponent(submittedValue)}&type=${type ?? ''}&createdBy=${userId ?? ''}`);
        setIsSearchOpen(false);
        setValue('');
    };

    if (!isSearchOpen) {
        return (
            <Button size="sm" isIconOnly aria-label="Search" className="button--orkg-secondary" onPress={() => setIsSearchOpen(true)}>
                <FontAwesomeIcon icon={faSearch} />
            </Button>
        );
    }

    return (
        <SearchField
            aria-label={placeholder || 'Search'}
            value={value}
            onChange={setValue}
            onSubmit={goToResults}
            onBlur={() => {
                if (!value) {
                    setIsSearchOpen(false);
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                    setValue('');
                }
            }}
            maxLength={MAX_LENGTH_INPUT}
            autoFocus
            variant="secondary"
        >
            <SearchField.Group className="md:h-8">
                <SearchField.SearchIcon />
                <SearchField.Input placeholder={placeholder} className="w-[200px]" />
                <SearchField.ClearButton />
            </SearchField.Group>
        </SearchField>
    );
};

export default HeaderSearchButton;
