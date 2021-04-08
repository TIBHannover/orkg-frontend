import styled from 'styled-components';
import { Button, ListGroupItem } from 'reactstrap';

/*contribution*/
export const StyledHorizontalContribution = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border-width: ${props => props.theme.borderWidth};
    border-color: ${props => props.theme.lightDarker};
    border-style: solid;
    border-top-left-radius: 0;
    padding: 25px 30px;
`;

export const StyledHorizontalContributionsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;

    // first item has border radius left
    li:first-child .contribution-item {
        border-top-left-radius: ${props => props.theme.borderRadius};
    }

    // last item has border radius right
    // in case in edit mode, the last item is the 'add' button, so use
    // :nth-last-child to select the second last child
    &.noEdit li:last-child .contribution-item,
    &:not(.noEdit) li:nth-last-child(2) .contribution-item {
        border-top-right-radius: ${props => props.theme.borderRadius};
    }

    li {
        display: inline-block;
        margin-right: 2px;

        .contribution-item {
            border: 1px solid ${props => props.theme.lightDarker};
            border-bottom: 0;
            background-color: ${props => props.theme.lightLighter};
            position: relative;
            box-sizing: border-box;
            padding: 7px 15px 7px 15px;
            display: block;
            transition: 0.3s background;
            color: inherit;
            outline: 0;

            &.disabled {
                pointer-events: none;
                cursor: default;
            }
            &:hover {
                text-decoration: none;
            }
            &.active-contribution {
                background: ${props => props.theme.orkgPrimaryColor};
                border: 1px solid ${props => props.theme.orkgPrimaryColor};
                color: #fff;
                cursor: initial !important;
            }
            &.active-contribution a {
                color: #fff;
            }
        }
    }
`;

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
            background-color: ${props => props.theme.orkgPrimaryColor};
            border: 1px solid ${props => props.theme.orkgPrimaryColor};
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
