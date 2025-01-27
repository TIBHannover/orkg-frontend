import styled from 'styled-components';

export const StatementWrapperStyled = styled.div`
    & .actionButtons {
        opacity: 0;
        // "visibility: hidden" behaves like a combination of "opacity: 0" and "pointer-events: none".
        pointer-events: none;
        transition: opacity 0.2s;
    }
    &:focus {
        outline: 0;
    }
    &:hover .actionButtons {
        opacity: 1;
        pointer-events: auto;
    }
    &.highlight {
        background: ${(props) => props.theme.primary} !important;
        .btn-link {
            color: #fff !important;
        }
        .text-break > a {
            color: #fff !important;
        }
        animation: blinkAnimation 0.7s 3;
    }

    @keyframes blinkAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
`;

export default StatementWrapperStyled;
