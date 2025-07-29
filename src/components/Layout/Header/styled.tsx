import { NavbarProps } from 'reactstrap';
import styled, { createGlobalStyle } from 'styled-components';

import HomeBannerBg from '@/assets/img/graph-background.svg';
import Navbar from '@/components/Ui/Nav/Navbar';

type GlobalStyleProps = {
    $scrollbarWidth?: number;
    $cookieInfoDismissed?: boolean | null;
};

// determine the scroll bar width and compensate the width when a modal is opened
export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
    body.modal-open {
        #main-navbar, #paperHeaderBar {
            right: ${(props) => props.$scrollbarWidth}px
        }
        #helpIcon {
            // @ts-expect-error
            padding-right: ${(props) => props.$scrollbarWidth}px
        }
        .woot-widget-bubble, .woot-widget-holder {
            // @ts-expect-error
            margin-right: ${(props) => props.$scrollbarWidth}px
        }
    }
    @media (min-width: 481px) and (max-width: 1100px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${(props) => (!props.$cookieInfoDismissed ? '80px' : '14px')}
        }
    }  
    @media (max-width: 480px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${(props) => (!props.$cookieInfoDismissed ? '150px' : '14px')}
        }
    }  
    
`;

export const StyledTopBar = styled.div`
    @media (max-width: ${(props) => props.theme.gridBreakpoints.xl}) {
        .navlink-ask {
            display: none;
        }
    }
    @media (max-width: ${(props) => props.theme.gridBreakpoints.md}) {
        .navbar-collapse {
            margin-top: 0.4rem;
        }
        .nav-item {
            border-top: 1px solid ${(props) => props.theme.light};
        }
        .btn:not(.search-icon) {
            width: 100%;
        }
        .btn-group {
            display: block !important;
        }
        .dropdown-menu {
            width: 100%;
        }
        .label {
            display: inline;
        }
        .input-group {
            width: 100%;
        }
        &.home-page {
            .nav-item {
                border-top-color: ${(props) => props.theme.secondaryDarker};
            }
        }
    }

    margin-bottom: 0;
    padding-top: 72px;

    &.home-page {
        // For the background
        background: #5f6474 url(${HomeBannerBg.src});
        background-position-x: 0%, 0%;
        background-position-y: 0%, 0%;
        background-size: auto, auto;
        background-size: cover;
        background-attachment: fixed;
        background-position: center 10%;
        background-repeat: no-repeat;
    }
    position: relative;
`;

type StyledNavbarProps = {
    transparent: string;
    theme: {
        secondary: string;
        gridBreakpoints: {
            md: string;
        };
    };
} & NavbarProps;

export const StyledNavbar = styled(Navbar)<StyledNavbarProps>`
    &&& {
        display: flex;
        width: 100%;
        transition: width 1s ease-in-out;
        background: ${(props) => (props.transparent === 'true' ? 'transparent' : 'white')};
        box-shadow: ${(props) => (props.transparent === 'true' ? 'none' : '0px 2px 8px 0px rgba(0, 0, 0, 0.13)')};
        border: 0;

        .nav-link {
            color: ${(props) => props.theme.secondary};

            &:hover {
                color: ${(props) => props.theme.primary};
            }
        }

        .search-box {
            input {
                border-right: 0;
            }

            .search-icon {
                color: ${(props) => props.theme.primary};
            }

            button {
                border: 1px solid #ced4da;
                border-left: 0 !important;
                background: ${(props) => props.theme.inputBg};
            }
        }
        ${({ transparent, theme }) =>
            transparent === 'true' &&
            `
         & .nav-link {
                color: white;
                &:hover {
                    color: #bbbbbb;
                }
            }
            & .sign-in {
                color: white;
                background: #32303b;
                border-color: #32303b;
                &:hover {
                    color: white;
                    background: #100f13;
                    border-color: #100f13;
                }
            }
            .search-box .search-icon {
                color: ${theme.secondary};
            }

            @media (max-width: ${theme.gridBreakpoints.md}) {
                background: #5f6474;
            }
      `}
    }
`;
