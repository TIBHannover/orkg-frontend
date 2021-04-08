import styled from 'styled-components';
import { ListGroupItem, Collapse } from 'reactstrap';

/*listGroupOpen*/
export const StyledListGroupOpen = styled(Collapse)`
    border-left-width: ${props => props.theme.borderWidth};
    border-right-width: ${props => props.theme.borderWidth};
    border-left-style: solid;
    border-right-style: solid;
    border-left-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
    border-right-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color; $list-group-border-color;*/
    padding: 0 !important; // set padding to 0 to ensure that Collapse height can be zero during the animation

    &.listGroupOpenBorderBottom {
        border-bottom-width: ${props => props.theme.borderWidth};
        border-bottom-style: solid;
        border-bottom-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
    }
`;

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
        color: ${props => props.theme.orkgPrimaryColor};

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
