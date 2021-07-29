import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, ButtonGroup, Container } from 'reactstrap';
import styled from 'styled-components';

const ButtonGroupStyled = styled(ButtonGroup)`
    @media (max-width: 480px) {
        display: none;
        flex-direction: column;
        width: 100%;

        > {
            margin-right: 0 !important;
        }
        > button:first-child,
        > .btn-group:first-child > button:first-child {
            border-radius: ${props => props.theme.borderRadius} ${props => props.theme.borderRadius} 0 0 !important;
        }
        > button:last-child,
        > .btn-group:last-child > button {
            border-radius: 0 0 ${props => props.theme.borderRadius} ${props => props.theme.borderRadius} !important;
        }
        > * {
            margin-top: 1px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
    }
`;

const MenuButton = styled(Button)`
    width: 100%;
    display: none;

    @media (max-width: 480px) {
        display: block;
    }
`;

const MainTitle = ({ title = '', children = null }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Container className="d-flex mt-4 mb-3 align-items-center flex-wrap">
            <h1 className="h4 flex-grow-1">{title}</h1>

            <MenuButton size="sm" color={!isMenuOpen ? 'secondary' : 'secondary-darker'} onClick={() => setIsMenuOpen(v => !v)}>
                <Icon icon={faBars} /> Menu
            </MenuButton>
            <ButtonGroupStyled className="float-right flex-shrink-0" style={isMenuOpen ? { display: 'flex' } : {}}>
                {children}
            </ButtonGroupStyled>
        </Container>
    );
};

MainTitle.propTypes = {
    title: PropTypes.string,
    buttons: PropTypes.node,
    children: PropTypes.node
};

export default MainTitle;
