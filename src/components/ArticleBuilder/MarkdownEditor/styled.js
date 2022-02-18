import styled from 'styled-components';

export const MarkdownContainer = styled.p`
    blockquote {
        color: rgba(0, 0, 0, 0.5);
        padding-left: 1.5em;
        border-left: 5px solid rgba(0, 0, 0, 0.1);
    }
    table td,
    table th {
        border: 1px solid #c4c4c4;
        padding: 3px 5px;
    }
    img {
        max-width: 100%;
    }
`;
