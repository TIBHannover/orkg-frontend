import Tippy from '@tippyjs/react';
import styled from 'styled-components';

export const TippyVisualization = styled(Tippy)`
    background-color: #fff;
    color: ${props => props.theme.bodyColor};
    border: 1px solid ${props => props.theme.primary};

    .tippy-content {
        padding: 0;
    }
    &[data-placement^='top'] > .tippy-arrow::before {
        border-top-color: ${props => props.theme.primary};
    }
    &[data-placement^='bottom'] > .tippy-arrow::before {
        border-bottom-color: ${props => props.theme.primary};
    }
    &[data-placement^='left'] > .tippy-arrow::before {
        border-left-color: ${props => props.theme.primary};
    }
    &[data-placement^='right'] > .tippy-arrow::before {
        border-right-color: ${props => props.theme.primary};
    }
`;
