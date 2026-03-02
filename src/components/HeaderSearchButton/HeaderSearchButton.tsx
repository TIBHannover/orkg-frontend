import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import { InputStyled, SearchButtonStyled, SearchStyled } from '@/components/styled';
import Button from '@/components/Ui/Button/Button';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';

type HeaderSearchButtonProps = {
    placeholder?: string;
    type?: string;
    userId?: string;
};

const HeaderSearchButton = ({ placeholder = '', type, userId }: HeaderSearchButtonProps) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [value, setValue] = useState('');
    const refContainer = useRef(null);
    const refInput = useRef<HTMLInputElement>(null);
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

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            closeSearch();
        } else if (e.key === 'Enter') {
            goToResults();
        }
    };

    const goToResults = () => {
        router.push(`${reverse(ROUTES.SEARCH)}?q=${encodeURIComponent(value)}&type=${type ?? ''}&createdBy=${userId ?? ''}`);
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
                <FontAwesomeIcon icon={faSearch} />
            </SearchButtonStyled>
        </SearchStyled>
    ) : (
        <Button size="sm" color="secondary" style={{ marginLeft: 1 }} className="px-3" onClick={() => setIsSearchOpen(true)}>
            <FontAwesomeIcon icon={faSearch} />
        </Button>
    );
};

export default HeaderSearchButton;
