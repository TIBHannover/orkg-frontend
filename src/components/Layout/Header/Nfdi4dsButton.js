import { useEffect } from 'react';
import { NavItem } from 'reactstrap';
import styled from 'styled-components';

const NavItemStyled = styled(NavItem)`
    @media (min-width: ${props => props.theme.gridBreakpoints.lg}) and (max-width: ${props => props.theme.gridBreakpoints.xl}) {
        .nfdi4ds-banner button span {
            display: none;
        }
    }
    @media (min-width: ${props => props.theme.gridBreakpoints.md}) and (max-width: ${props => props.theme.gridBreakpoints.lg}) {
        .nfdi4ds-banner {
            display: none;
        }
    }
    @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
        padding-left: 0 !important;
        .nfdi4ds-banner {
            padding: 10px 0;
        }
    }
`;

const Nfdi4dsButton = () => {
    useEffect(() => {
        (function(w, d, s, o, f, js, fjs) {
            w.nfdi4dsWidget = o;
            w[o] =
                w[o] ||
                function() {
                    (w[o].q = w[o].q || []).push(arguments);
                };
            // eslint-disable-next-line no-unused-expressions, no-sequences
            (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
            js.id = o;
            js.src = f;
            js.async = 1;
            fjs?.parentNode.insertBefore(js, fjs);
        })(window, document, 'script', 'nfdi4ds', 'https://tibhannover.gitlab.io/nfdi4ds/nfdi4ds-widget/widget.js');
        window.nfdi4ds('widget');

        return () => {
            document.getElementById('nfdi4ds')?.remove();
        };
    }, []);

    return (
        <NavItemStyled className="ps-3 d-flex align-items-center">
            <div className="nfdi4ds-banner" data-variant="button" data-button-color="dark" data-menu-color="light" />
        </NavItemStyled>
    );
};

export default Nfdi4dsButton;
