import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { KeyboardEvent, useState } from 'react';
import { Button, Input, InputGroup } from 'reactstrap';

import useParams from '@/components/useParams/useParams';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';

const HelpCenterSearchInput = () => {
    const router = useRouter();
    const params = useParams();
    const [value, setValue] = useState(params.searchQuery ?? '');

    const handleSearch = () => {
        router.push(reverse(ROUTES.HELP_CENTER_SEARCH, { searchQuery: encodeURIComponent(value.toString()) }));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <InputGroup className="mt-2 mb-4">
            <Input
                placeholder="Search for articles..."
                bsSize="lg"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={MAX_LENGTH_INPUT}
            />

            <Button onClick={handleSearch}>Search</Button>
        </InputGroup>
    );
};

export default HelpCenterSearchInput;
