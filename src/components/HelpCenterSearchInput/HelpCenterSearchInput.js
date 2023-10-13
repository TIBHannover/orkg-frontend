import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useState } from 'react';
import useRouter from 'components/NextJsMigration/useRouter';
import useParams from 'components/NextJsMigration/useParams';
import { Button, Input, InputGroup } from 'reactstrap';

const HelpCenterSearchInput = () => {
    const router = useRouter();
    const params = useParams();
    const [value, setValue] = useState(params.searchQuery ?? '');

    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = () => {
        router.push(reverse(ROUTES.HELP_CENTER_SEARCH, { searchQuery: encodeURIComponent(value) }));
    };

    return (
        <InputGroup className="mt-2 mb-4">
            <Input
                placeholder="Search for articles..."
                bsSize="lg"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <Button onClick={handleSearch}>Search</Button>
        </InputGroup>
    );
};

export default HelpCenterSearchInput;
