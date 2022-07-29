import styled from 'styled-components';
import { ListGroupItem } from 'reactstrap';

/* propertyItem */
export const StyledStatementItem = styled(ListGroupItem)`
    padding: 0.5rem 0.75rem !important;
    cursor: default;
    background-color: ${props => props.theme.lightLighter} !important;
    border-color: ${props => props.theme.lightDarker} !important;
    overflow-wrap: break-word;
    word-break: break-all;
    flex: 1;

    &.selectable {
        cursor: pointer;
    }

    & > .statementItemIcon {
        font-size: 18px;
        margin-top: 3px;
        color: ${props => props.theme.primary};

        &.open {
            color: #fff;
        }
    }

    & > .deletePredicate {
        font-size: 90%;
        display: none;

        &:hover {
            text-decoration: underline;
        }
    }

    &.statementActive {
        background-color: ${props => props.theme.secondary} !important;
        border-color: ${props => props.theme.secondary} !important;
        color: #fff;

        & .deletePredicate {
            display: inline-block !important;
        }
    }
`;
