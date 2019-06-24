import styled from 'styled-components';
import ContentEditable from 'react-contenteditable'
import { ListGroupItem, InputGroup, DropdownItem } from 'reactstrap';

/*contribution*/
export const StyledContribution = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border-width: ${props => props.theme.borderWidth};
    border-color: ${props => props.theme.orkgPrimaryColor};
    border-style: solid;
    padding: 15px 30px;
`;

/*contributionsList*/
export const StyledContributionsList = styled.ul`
    list-style: none;
    padding: 0;
    padding-top: 15px;

    > li {
        padding: 9px 10px 9px 15px;
        margin-bottom: 5px;
        transition: 0.3s background;
        border-top-left-radius: ${props => props.theme.borderRadius};
        border-bottom-left-radius: ${props => props.theme.borderRadius};

        > span {
            cursor: pointer;
        }
        &.activeContribution {
            background: ${props => props.theme.orkgPrimaryColor};
            color: #fff;
            cursor: initial !important;
        }
        &.activeContribution a{
            color: #fff;
        }
        .deleteContribution {
            cursor: pointer;
            color:#fff;
        }
        .selectContribution {
            cursor:pointer;

            &:hover {
                text-decoration: underline;
            }
        }
        &.addContribution span:hover {
            text-decoration: underline;
        }
    }
`;

/*contributionsList*/
export const StyledContentEditable = styled(ContentEditable)`
    &:focus {
    background: #fff;
    color: ${props => props.theme.orkgPrimaryColor};
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    padding: 0 4px;
    display: block;
  }
`;

/*researchFieldsInput*/
export const StyledResearchFieldsInputFormControl = styled.div`
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    height: auto !important;
    min-height: calc(2.25rem + 4px);
    cursor: text;
    padding: 0 !important;

    & input {
    border: 0;
    background: transparent;
    max-width: 100%;
    outline: 0;
    margin: 5px 2px;
    }
`;

/*researchFieldBrowser*/
export const StyledResearchFieldBrowser = styled.div`
    margin: 5px auto;
    height: auto !important;
    cursor: text;
`;

/*statementItem*/
export const StyledStatementItem = styled(ListGroupItem)`
    padding: 0.5rem 0.75rem !important;
    cursor: default;
    background-color: ${props => props.theme.ultraLightBlue} !important; 
    border-color: ${props => props.theme.ultraLightBlueDarker} !important; 

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
        background-color: ${props => props.theme.darkblue}  !important;
        border-color: ${props => props.theme.darkblue}  !important;

        & .deletePredicate {
            display: inline-block !important;
        }
    }
`;

/*addStatement*/
export const StyledAddStatement = styled(InputGroup)`
    & input[type="text"] {
        background: #fff !important;
    }
    & .addStatementActionButton {
        padding: 0 15px;
        font-size: 95%;
        border-color: ${props => props.theme.listGroupBorderColor};
    }
`;

/*listGroupOpen*/
export const StyledListGroupOpen = styled.div`
    border-left-width: ${props => props.theme.borderWidth};
    border-right-width: ${props => props.theme.borderWidth};
    border-left-style: solid;
    border-right-style: solid;
    border-left-color: #DFDFDF; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
    border-right-color: #DFDFDF; /*don't use default color, since it is partially transparent $list-group-border-color; $list-group-border-color;*/
    padding: 10px 20px;

    &.listGroupOpenBorderBottom {
        border-bottom-width: ${props => props.theme.borderWidth};
        border-bottom-style: solid;
        border-bottom-color: #DFDFDF; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
    }
`;


/*levelBox*/
export const StyledLevelBox = styled.div`
    border-color: #DFDFDF; /*don't use default color, since it is partially transparent $list-group-border-color;*/
    border-radius: ${props => props.theme.borderRadius};
    padding-left: 8px;
    border-style: solid;
    border-width: 2px;
    //box-shadow: -2px 0px 4px 0px rgba(0, 0, 0, 0.06);
    margin-top: -2px;
    margin-right: -2px;
    margin-bottom: -2px;

    .listGroupEnlarge {
        margin-top: -2px;
        margin-right: -2px;
        margin-bottom: -2px;
    }
`;

/* valueItem */
export const StyledValueItem = styled(ListGroupItem)`
    padding: 8px 0px !important;

    & .objectLink {
        text-decoration: underline;
        cursor: pointer;
    }
    & .deleteValue {
        font-size: 90%;
        //display: none;
        cursor: pointer;
        color: ${props => props.theme.orkgPrimaryColor};
        display: none;

        &:hover {
            text-decoration: underline;
        }
    }
    &:hover {
        & .deleteValue {
            display: inline-block;
        }
    }
    & .valueTypeDropdown {
        font-size: 95%;
        padding: 0 15px;
        min-width: 95px;
    }
    & .valueActionButton {
        padding: 0 15px;
        font-size: 95%;
        border-color: ${props => props.theme.listGroupBorderColor};
    }
`;

/*dropdownItem*/
export const StyledDropdownItem = styled(DropdownItem)`
    outline: 0;
    & svg {
        display: none;
        color: #989898 !important;
    }
    &:hover svg {
        display: inline-block;
    }
`;