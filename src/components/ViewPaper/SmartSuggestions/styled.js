import styled from 'styled-components';

import Button from '@/components/Ui/Button/Button';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';

export const PropertyItem = styled(ListGroupItem)`
    background-color: ${(props) => props.theme.smart}!important;
    color: #fff !important;
    padding: 1rem 0.6rem;
    font-weight: 500;
`;

export const ValueItem = styled(ListGroupItem)`
    background-color: transparent !important;
    &:hover {
        background-color: #cee5e9 !important;
    }
`;

export const ShowMoreButton = styled(Button)`
    &:focus {
        outline: 0 !important;
        box-shadow: none;
    }
`;

export const SuggestionsBox = styled.div`
    padding: 12px 10px;
    background-color: #ecf6f8;
    border: 1px solid #c4e2e9;
`;
