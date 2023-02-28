import styled from 'styled-components';
import { Button } from 'reactstrap';

export const AddContribution = styled(Button)`
    &&& {
        padding: 0;
        border: 1px solid ${props => props.theme.lightDarker};
        background-color: ${props => props.theme.lightLighter};
        border-radius: 60px;
        margin: 0 5px;
        cursor: pointer;
        outline: 0;
        color: inherit;

        span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 25px;
            height: 25px;
        }

        &:hover {
            background-color: ${props => props.theme.primary};
            border: 1px solid ${props => props.theme.primary};
            color: #fff;
        }
    }
`;

export const ActionButton = styled(Button)`
    &&& {
        color: inherit;
        padding: 0;
        line-height: 1;
        margin-top: -3px;
    }
`;
