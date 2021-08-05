import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, ButtonGroup, Container } from 'reactstrap';
import styled from 'styled-components';

const ContainerStyled = styled(Container)`
    @media (max-width: ${props => props.theme.gridBreakpoints.sm}) {
        margin-top: 1rem !important;
        flex-wrap: wrap;
    }
`;
const ButtonGroupStyled = styled(ButtonGroup)`
    margin-left: auto;

    @media (max-width: ${props => props.theme.gridBreakpoints.sm}) {
        display: none;
        flex-direction: column;
        width: 100%;
        margin-top: 0.2rem;

        > {
            margin-right: 0 !important;
        }
        > button:first-child,
        > .btn:first-child,
        > .btn-group:first-child > button:first-child {
            border-radius: ${props => props.theme.borderRadius} ${props => props.theme.borderRadius} 0 0 !important;
        }
        > button:last-child,
        > .btn:last-child,
        > .btn-group:last-child > button {
            border-radius: 0 0 ${props => props.theme.borderRadius} ${props => props.theme.borderRadius} !important;
        }
        > button:first-child:last-child,
        .btn:first-child:last-child,
        .btn-group:first-child:last-child > button {
            border-radius: ${props => props.theme.borderRadius} !important;
        }
        > * {
            margin-top: 1px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }

        .dropdown-menu {
            width: calc(100% - 0rem);
        }
    }
`;

const MenuButton = styled(Button)`
    display: none;
    flex-grow: 0;
    margin-left: auto;

    @media (max-width: ${props => props.theme.gridBreakpoints.sm}) {
        display: block;
    }
`;

const TitleBar = ({ buttonGroup = null, titleAddition = null, children = '', wrap = true, titleSize = 'h4' }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <ContainerStyled className={`d-flex mt-4 mb-4 align-items-center ${wrap ? 'flex-wrap' : ''}`}>
            <h1 className={`${titleSize} m-0 mr-3  ${!wrap ? 'flex-shrink-0' : ''}`}>{children}</h1> {titleAddition}
            {buttonGroup && (
                <MenuButton
                    aria-label="Open action menu"
                    size="sm"
                    color={!isMenuOpen ? 'secondary' : 'secondary-darker'}
                    onClick={() => setIsMenuOpen(v => !v)}
                >
                    <Icon icon={faEllipsisV} />
                </MenuButton>
            )}
            {buttonGroup && (
                <ButtonGroupStyled className="flex-shrink-0" style={isMenuOpen ? { display: 'flex' } : {}}>
                    {buttonGroup}
                </ButtonGroupStyled>
            )}
        </ContainerStyled>
    );
};

TitleBar.propTypes = {
    buttonGroup: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    titleAddition: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    titleSize: PropTypes.string,
    wrap: PropTypes.bool
};

export default TitleBar;
