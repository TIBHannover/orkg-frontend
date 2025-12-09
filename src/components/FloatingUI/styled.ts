import styled from 'styled-components';

export const FloatingContentStyled = styled.div`
    background-color: #444;
    color: white;
    font-size: 90%;
    padding: 4px 8px;
    border-radius: 4px;
    box-sizing: border-box;
    width: max-content;
    max-width: calc(100vw - 10px);
    z-index: 99999;
    transition-property: opacity;

    &[data-status='open'] {
        transition-duration: 300ms;
    }
    &[data-status='close'] {
        transition-duration: 250ms;
    }
    &[data-status='initial'],
    &[data-status='close'] {
        opacity: 0;
    }
`;

export default FloatingContentStyled;
