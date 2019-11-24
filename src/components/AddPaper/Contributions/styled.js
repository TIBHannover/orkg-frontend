import styled from 'styled-components';
import { ListGroupItem, InputGroup, DropdownItem, Button, DropdownToggle } from 'reactstrap';

/*contribution*/
export const StyledContribution = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border-width: ${props => props.theme.borderWidth};
    border-color: ${props => props.theme.orkgPrimaryColor};
    border-style: solid;
    padding: 15px 30px;
`;

/*contribution*/
export const StyledHorizontalContribution = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border-width: ${props => props.theme.borderWidth};
    border-color: ${props => props.theme.ultraLightBlueDarker};
    border-style: solid;
    border-top-left-radius: 0;
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
        &.activeContribution a {
            color: #fff;
        }
        .deleteContribution {
            cursor: pointer;
            color: #fff;
        }
        .selectContribution {
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }
        &.addContribution span:hover {
            text-decoration: underline;
        }
    }
`;

export const StyledHorizontalContributionsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;

    > li {
        &:nth-last-child(2) {
            border-top-right-radius: ${props => props.theme.borderRadius};
        }

        &:first-child {
            border-top-left-radius: ${props => props.theme.borderRadius};
        }

        border: 2px solid ${props => props.theme.ultraLightBlueDarker};
        background-color: ${props => props.theme.ultraLightBlue};
        margin-right: 2px;
        border-bottom: 0;
        margin-bottom: -2px;
        position: relative;
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        display: inline-block;
        padding: 9px 15px 9px 15px;
        transition: 0.3s background;
        cursor: pointer;

        &:hover {
            text-decoration: none;
        }
        &.activeContribution {
            background: ${props => props.theme.orkgPrimaryColor};
            border: 2px solid ${props => props.theme.orkgPrimaryColor};
            color: #fff;
            cursor: initial !important;
        }
        &.activeContribution a {
            color: #fff;
        }
        .deleteContribution {
            cursor: pointer;
            color: #fff;
        }
        &.addContribution {
            & span {
                padding: 1px 8px;
                display: inline-block;
            }
            padding: 0;
            border: 2px solid ${props => props.theme.ultraLightBlueDarker};
            border-radius: 60px;
            margin: 0 5px;
            cursor: pointer;
        }
        &.addContribution:hover {
            background-color: ${props => props.theme.orkgPrimaryColor};
            border: 2px solid ${props => props.theme.orkgPrimaryColor};
            color: #fff;
        }
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

/*propertyItem*/
export const StyledStatementItem = styled(ListGroupItem)`
    padding: 0.5rem 0.75rem !important;
    cursor: default;
    background-color: ${props => props.theme.ultraLightBlue} !important;
    border-color: ${props => props.theme.ultraLightBlueDarker} !important;

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

/*addProperty*/
export const StyledAddProperty = styled(InputGroup)`
    & input[type='text'] {
        background: #fff !important;
    }
    & .addPropertyActionButton {
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
    border-left-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
    border-right-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color; $list-group-border-color;*/
    padding: 10px 20px;

    &.listGroupOpenBorderBottom {
        border-bottom-width: ${props => props.theme.borderWidth};
        border-bottom-style: solid;
        border-bottom-color: #dfdfdf; /*don't use default color, since it is partially transparent $list-group-border-color;$list-group-border-color;*/
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

    .listGroupEnlarge {
        margin-top: -2px;
        margin-right: -2px;
        margin-bottom: -2px;
        display: block;
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
        &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
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

/* Template Wizzard */
export const StyledButton = styled(Button)`
    border-top-right-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
    border-color: #ced4da !important;
    color: ${props => props.theme.buttonDark} !important;
    background: ${props => props.theme.ultraLightBlueDarker} !important;
    &:hover {
        color: #fff !important;
        background-color: ${props => props.theme.darkblue} !important;
        border-color: ${props => props.theme.darkblue} !important;
    }
`;

export const StyledDropdownToggle = styled(DropdownToggle)`
    border-top-left-radius: 4px !important;
    border-bottom-left-radius: 4px !important;
    background: ${props => props.theme.ultraLightBlueDarker} !important;
    color: ${props => props.theme.buttonDark} !important;
    border-color: #ced4da !important;
    &:hover {
        color: #fff !important;
        background-color: ${props => props.theme.darkblue} !important;
        border-color: ${props => props.theme.darkblue} !important;
    }
`;

export const ValueItemStyle = styled.div`
    background-color: #fff;
    margin-bottom: 10px;
    &:hover .valueOptions {
        display: inline-block !important;
    }
    &.editingLabel {
        margin-bottom: 1px !important;
    }
    & input,
    & input:focus {
        outline: 0 !important;
        box-shadow: none !important;
        border-color: #ced4da !important;
        border-top-left-radius: 4px !important;
        border-bottom-left-radius: 4px !important;
    }
    & .btn {
    }
    .valueLabel {
        display: inline;
        margin-right: 4px;
        text-decoration: underline;
    }
    .valueOptions {
        display: none;
    }
`;

export const AddPropertyStyle = styled.div`
    &.inTemplate {
        background-color: transparent;
        border: 0;
        margin: -16.5px 10px;
        padding: 0;
    }
`;

export const AddPropertyContentStyle = styled.span`
    display: inline-block !important;
    position: relative;
    z-index: 10px;
    border-radius: 4px;
    max-width: 33.33%;
    font-size: small;
    color: ${props => props.theme.darkblue};
    transition: 0.3s max-width;
    cursor: pointer;

    &.noTemplate {
        &.large {
            width: 100%;
            padding: 0;
            border: 0 !important;
        }
    }

    &.inTemplate {
        padding: 5px 10px;
        width: 30%;
        text-align: center;
        background-color: ${props => props.theme.ultraLightBlue};
        border: 2px solid rgba(0, 0, 0, 0.125) !important;
        &.large {
            width: 100%;
            padding: 0;
            border: 0 !important;
            .icon {
                color: ${props => props.theme.darkblue};
            }
        }
        &:hover {
            background-color: ${props => props.theme.darkblue};
            color: #fff;
        }
    }
`;

export const AddPropertyButton = styled.div`
    border-radius: 4px;
    line-height: 19px;

    &.noTemplate {
        background-color: ${props => props.theme.darkblue};
        color: #fff;
        border: 2px solid ${props => props.theme.darkblue};
        padding: 5px 14px;
        &:hover {
            background-color: ${props => props.theme.ultraLightBlue};
            border: 2px solid rgba(0, 0, 0, 0.125) !important;
            color: ${props => props.theme.darkblue};
        }
    }
`;

export const AddPropertyFormStyle = styled.div`
    & input,
    & input:focus {
        border-left: 0;
        outline: 0;
        box-shadow: none;
    }

    .input-group-prepend {
        background-color: ${props => props.theme.ultraLightBlue};
        cursor: default;
        display: inline-block;
        text-align: center;
        border: 2px solid rgba(0, 0, 0, 0.125);
        border-bottom-left-radius: 4px;
        border-top-left-radius: 4px;
        width: 24px;
        padding: 0.25rem 0.5rem 0;
        .icon {
            padding: 0;
            margin: 0;
            line-height: 40px;
            font-size: 12px;
        }
    }
`;
