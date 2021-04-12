import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { useClickAway } from 'react-use';
import { Button } from 'reactstrap';
import styled from 'styled-components';

const SearchStyled = styled.div`
    &&& {
        padding: 0;
        margin-left: 1px !important;
        display: flex;
    }
`;

const InputStyled = styled.input`
    background: transparent;
    line-height: 0.7;
    padding: 2px 10px;
    height: 28px;
    border: 0;
    color: #fff;
    width: 200px;
    animation: width 0.2s normal forwards ease-in-out;
    outline: 0;

    &::placeholder {
        color: #fff;
        opacity: 0.6;
    }

    @keyframes width {
        from {
            width: 50px;
        }
        to {
            width: 200px;
        }
    }
`;

const SearchButtonStyled = styled(Button)`
    &&& {
        color: #fff;
        border: 0;
    }
`;

const HeaderSearchButton = ({ placeholder, type }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [value, setValue] = useState('');
    const refContainer = useRef(null);
    const refInput = useRef(null);
    const history = useHistory();

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

    const handleKeyDown = e => {
        if (e.key === 'Escape') {
            closeSearch();
        } else if (e.key === 'Enter') {
            goToResults();
        }
    };

    const goToResults = () => {
        history.push(reverse(ROUTES.SEARCH, { searchTerm: encodeURIComponent(value) }) + `?types=${type}`);
    };

    return isSearchOpen ? (
        <SearchStyled className="btn btn-secondary btn-sm active" ref={refContainer}>
            <InputStyled
                type="text"
                placeholder={placeholder}
                ref={refInput}
                onKeyDown={handleKeyDown}
                value={value}
                onChange={e => setValue(e.target.value)}
            />
            <SearchButtonStyled size="sm" className="px-3" color="link" onClick={() => setIsSearchOpen(true)}>
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
    type: PropTypes.string.isRequired
};

HeaderSearchButton.defaultProps = {
    placeholder: ''
};

export default HeaderSearchButton;
