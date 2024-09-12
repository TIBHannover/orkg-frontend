import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { Button } from 'reactstrap';
import { useRouter } from 'next/navigation';
import { SearchStyled, InputStyled, SearchButtonStyled } from 'components/styled';
import { MAX_LENGTH_INPUT } from 'constants/misc';

const HeaderSearchButton = ({ placeholder = '', type, userId }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [value, setValue] = useState('');
    const refContainer = useRef(null);
    const refInput = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (isSearchOpen && refInput.current) {
            refInput.current.focus();
        }
    }, [isSearchOpen]);

    const closeSearch = () => {
        setIsSearchOpen(false);
        setValue('');
    };

    useClickAway(refContainer, () => {
        if (isSearchOpen) {
            closeSearch();
        }
    });

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeSearch();
        } else if (e.key === 'Enter') {
            goToResults();
        }
    };

    const goToResults = () => {
        router.push(`${reverse(ROUTES.SEARCH)}?q=${encodeURIComponent(value)}&types=${type ?? ''}&createdBy=${userId ?? ''}`);
    };

    return isSearchOpen ? (
        <SearchStyled className="btn btn-secondary btn-sm active" ref={refContainer}>
            <InputStyled
                type="text"
                placeholder={placeholder}
                ref={refInput}
                onKeyDown={handleKeyDown}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={MAX_LENGTH_INPUT}
            />
            <SearchButtonStyled size="sm" className="px-3" color="link" onClick={() => (isSearchOpen ? goToResults() : setIsSearchOpen(true))}>
                <Icon icon={faSearch} />
            </SearchButtonStyled>
        </SearchStyled>
    ) : (
        <Button size="sm" color="secondary" style={{ marginLeft: 1 }} className="px-3" onClick={() => setIsSearchOpen(true)}>
            <Icon icon={faSearch} />
        </Button>
    );
};

HeaderSearchButton.propTypes = {
    placeholder: PropTypes.string,
    type: PropTypes.string,
    userId: PropTypes.string,
};

export default HeaderSearchButton;
