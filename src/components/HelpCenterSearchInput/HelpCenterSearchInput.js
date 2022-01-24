import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Input, InputGroup } from 'reactstrap';

const HelpCenterSearchInput = () => {
    const history = useHistory();
    const params = useParams();
    const [value, setValue] = useState(params.searchQuery ?? '');

    const handleKeyDown = e => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    const handleSearch = () => {
        history.push(reverse(ROUTES.HELP_CENTER_SEARCH, { searchQuery: encodeURIComponent(value) }));
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
