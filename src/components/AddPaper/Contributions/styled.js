import styled from 'styled-components';
import { ListGroupItem } from 'reactstrap';

/*contribution*/
export const StyledHorizontalContribution = styled.div`
    border-radius: ${props => props.theme.borderRadius};
    border-width: ${props => props.theme.borderWidth};
    border-color: ${props => props.theme.ultraLightBlueDarker};
    border-style: solid;
    border-top-left-radius: 0;
    padding: 25px 30px;
`;

export const StyledHorizontalContributionsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;

    // support for a > li (used in ViewPaper)
    a {
        color: inherit;

        li:first-child {
            border-top-left-radius: 0;
        }
        &:first-child li {
            border-top-left-radius: ${props => props.theme.borderRadius};
        }
        &:nth-last-child(2) li {
            border-top-right-radius: ${props => props.theme.borderRadius};
        }
    }

    &.noEdit {
        a:last-child li,
        > li:last-child {
            border-top-right-radius: ${props => props.theme.borderRadius};
        }
        a:nth-last-child(2) li,
        > li:nth-last-child(2) {
            border-top-right-radius: 0;
        }
    }

    li {
        a {
            color: inherit;
        }

        &:nth-last-child(2) {
            border-top-right-radius: ${props => props.theme.borderRadius};
        }

        &:first-child {
            border-top-left-radius: ${props => props.theme.borderRadius};
        }

        border: 1px solid ${props => props.theme.ultraLightBlueDarker};
        background-color: ${props => props.theme.ultraLightBlue};
        margin-right: 2px;
        border-bottom: 0;
        margin-bottom: -1px;
        position: relative;
        box-sizing: border-box;
        -moz-box-sizing: border-box;
        -webkit-box-sizing: border-box;
        display: inline-block;
        padding: 7px 15px 7px 15px;
        transition: 0.3s background;
        cursor: pointer;

        &.disabled {
            pointer-events: none;
            cursor: default;
        }

        &:hover {
            text-decoration: none;
        }
        &.activeContribution {
            background: ${props => props.theme.orkgPrimaryColor};
            border: 1px solid ${props => props.theme.orkgPrimaryColor};
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
            padding: 0;
            border: 1px solid ${props => props.theme.ultraLightBlueDarker};
            border-radius: 60px;
            margin: 0 5px;
            cursor: pointer;

            span {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 25px;
                height: 25px;
            }
        }
        &.addContribution:hover {
            background-color: ${props => props.theme.orkgPrimaryColor};
            border: 1px solid ${props => props.theme.orkgPrimaryColor};
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
