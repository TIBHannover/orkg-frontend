import styled from 'styled-components';
import { ListGroupItem } from 'reactstrap';

/*Statements.js*/
export const StyledStatementItem = styled(ListGroupItem)`
    padding: 0.5rem 0.75rem !important;
    cursor: default;
    background-color: ${props => props.theme.ultraLightBlue} !important;
    border-color: ${props => props.theme.ultraLightBlueDarker} !important;
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
        background-color: ${props => props.theme.darkblue} !important;
        border-color: ${props => props.theme.darkblue} !important;
        color: #fff;

        & .deletePredicate {
            display: inline-block !important;
        }
    }
`;

/*levelBox*/
export const StyledLevelBox = styled.div`
    border-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color;*/
    border-radius: ${props => props.theme.borderRadius};
    padding-left: 8px;
    border-style: solid;
    border-width: 2px;
    //box-shadow: -2px 0px 4px 0px rgba(0, 0, 0, 0.06);
    margin-top: -2px;
    margin-right: -2px;
    margin-bottom: -2px;
    display: block;

    .listGroupEnlarge {
        margin-top: -2px;
        margin-right: -2px;
        margin-bottom: -2px;
        display: flex;
        flex: 1;
    }
`;

/*listGroupOpen*/
export const StyledListGroupOpen = styled.div`
    border-left-width: ${props => props.theme.borderWidth};
    border-right-width: ${props => props.theme.borderWidth};
    border-left-style: solid;
    border-right-style: solid;
    border-left-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
    border-right-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color; $list-group-border-color;*/
    padding: 10px 20px;

    &.listGroupOpenBorderBottom {
        border-bottom-width: ${props => props.theme.borderWidth};
        border-bottom-style: solid;
        border-bottom-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
    }
`;
