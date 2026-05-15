'use client';

import { Label, SearchField } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import useParams from '@/components/useParams/useParams';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type HelpCenterSearchInputProps = {
    placeholder?: string;
    className?: string;
};

const HelpCenterSearchInput = ({ placeholder = 'Search for articles...', className }: HelpCenterSearchInputProps) => {
    const router = useRouter();
    const params = useParams();
    const [value, setValue] = useState((params.searchQuery ?? '').toString());

    const handleSubmit = (next: string) => {
        const query = next.trim();
        if (!query) return;
        router.push(reverse(ROUTES.HELP_CENTER_SEARCH, { searchQuery: query }));
    };

    return (
        <SearchField aria-label="Search the help center" value={value} onChange={setValue} onSubmit={handleSubmit} fullWidth className={className}>
            <Label className="sr-only">Search the help center</Label>
            <SearchField.Group className="h-12">
                <SearchField.SearchIcon />
                <SearchField.Input placeholder={placeholder} maxLength={MAX_LENGTH_INPUT} />
                <SearchField.ClearButton />
            </SearchField.Group>
        </SearchField>
    );
};

export default HelpCenterSearchInput;
