import styled from 'styled-components';

import Input from '@/components/Ui/Input/Input';

export const EditableTitle = styled(Input)`
    width: 100%;
    border: 0;
    background: inherit !important;
    font-size: inherit;
    padding: 0 5px;
    border-radius: ${(props) => props.theme.borderRadius};
    color: inherit;
    resize: none;
`;

export const SectionStyled = styled.div`
    position: relative;
    padding: 10px 40px 10px 40px !important;

    a {
        text-decoration: underline;
    }
`;

export const SectionTypeStyled = styled.button`
    background: var(--background);
    border: 1px solid #c5cadb;
    border-radius: 3px;
    position: absolute;
    right: -6px;
    top: -6px;
    color: ${(props) => props.theme.secondary};
    text-transform: uppercase;
    font-weight: bold;
    font-size: 90%;
    padding: 1px 15px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

    &:disabled {
        cursor: not-allowed;
    }
`;

export const SectionTypeContainerStyled = styled.div`
    min-width: 250px;
    border-radius: 6px;
    position: absolute;
    right: -6px;
    top: -6px;
    padding: 1px 1px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

    &:disabled {
        cursor: not-allowed;
    }
`;

export const MarkdownPlaceholder = styled.span`
    color: #aaa;
`;
