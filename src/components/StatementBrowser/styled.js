import styled from 'styled-components';
import { ListGroupItem, DropdownItem, Button, DropdownToggle } from 'reactstrap';

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

/*levelBox*/
export const StyledLevelBox = styled.div`
    // The hierarchy indicator doesn't look nice when properties have a space between them
    /*border-color: #dfdfdf; //don't use default color, since it is partially transparent $list-group-border-color;
    border-radius: ${props => props.theme.borderRadius};
    padding-left: 8px;
    border-style: solid;
    border-width: 1px;
    box-shadow: -2px 0px 4px 0px rgba(0, 0, 0, 0.06);
    margin-top: -1px;
    margin-right: -1px;
    margin-bottom: -1px;
    display: block;*/

    .listGroupEnlarge {
        margin-top: -2px;
        margin-right: -2px;
        margin-bottom: -2px;
        display: flex;
        flex: 1;
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

/* Template Wizard */
export const StyledButton = styled(Button)`
    border-color: #ced4da !important;
    color: ${props => props.theme.dark} !important;
    background: ${props => props.theme.lightDarker} !important;
    &:hover {
        color: #fff !important;
        background-color: ${props => props.theme.secondary} !important;
        border-color: ${props => props.theme.secondary} !important;
    }
`;

export const StyledDropdownToggle = styled(DropdownToggle).withConfig({
    shouldForwardProp: prop => !['disableBorderRadiusLeft', 'disableBorderRadiusRight'].includes(prop)
})`
    border-top-left-radius: ${props => (props.disableBorderRadiusLeft ? '0' : '4px !important')};
    border-bottom-left-radius: ${props => (props.disableBorderRadiusLeft ? '0' : '4px !important')};
    border-top-right-radius: ${props => (props.disableBorderRadiusRight ? '0' : '4px !important')};
    border-bottom-right-radius: ${props => (props.disableBorderRadiusRight ? '0' : '4px !important')};
    background: ${props => props.theme.lightDarker} !important;
    color: ${props => props.theme.dark} !important;
    border-color: #ced4da !important;
    &:hover {
        color: #fff !important;
        background-color: ${props => props.theme.secondary} !important;
        border-color: ${props => props.theme.secondary} !important;
    }
`;

export const ValueItemStyle = styled(ListGroupItem)`
    background-color: #fff;
    overflow-wrap: break-word;
    padding: 8px 0px !important;

    &:last-child {
        margin-bottom: 5px;
    }

    .valueOptions {
        visibility: hidden;
        display: inline-block !important;
        transition: visibility 0.2s, opacity 0.2s;
        opacity: 0;

        &.disableHover {
            visibility: visible;
            opacity: 1;
        }
    }

    &:hover .valueOptions {
        visibility: visible;
        opacity: 1;
    }

    &:focus-within .valueOptions {
        visibility: visible;
        opacity: 1;
    }

    &.editingLabel {
        margin-bottom: 1px !important;
    }

    & input,
    & input:focus {
        outline: 0 !important;
        box-shadow: none !important;
        border-color: #ced4da !important;
    }

    .objectLabel {
        display: inline;
        margin-right: 4px;
        text-decoration: underline;
        cursor: pointer;
    }

    .literalLabel {
        display: inline;
        margin-right: 4px;
        text-decoration: none;
        cursor: text;
    }

    .typeCircle {
        width: 18px;
        height: 18px;
        line-height: 18px;
        text-align: center;
        color: white;
        display: inline-block;
        border: 1px ${props => props.theme.secondaryDarker} solid;
        margin-right: 3px;
        border-radius: 100%;
        font-size: 12px;
        font-weight: bold;
        background: ${props => props.theme.secondary};
    }

    &:hover .typeCircle {
        background: ${props => props.theme.primary};
    }
`;

export const AddPropertyStyle = styled.div`
    &.inTemplate {
        background-color: transparent;
        border: 0;
        margin: -14.5px 10px;
        padding: 0;
        height: 30px; /* fixed height: prevents bug in chrome that moves items around, even though the height doesn't change */
    }
`;

export const AddPropertyContentStyle = styled.span`
    display: inline-block !important;
    position: relative;
    z-index: 10px;
    border-radius: 4px;
    max-width: 33.33%;
    font-size: 0.875rem;
    color: ${props => props.theme.secondary};
    transition: 0.3s max-width;
    cursor: pointer;

    &.noTemplate {
        &.large {
            max-width: 100%;
            width: 100%;
            padding: 0;
            border: 0 !important;
        }
    }

    &.inTemplate {
        width: 30%;

        button {
            padding: 2px 10px;
            width: 100%;
            border: 1px solid rgba(0, 0, 0, 0.125);
        }

        &.large {
            width: 100%;
            max-width: 100%;
            padding: 0;
            border: 0 !important;
            .icon {
                color: ${props => props.theme.secondary};
            }
        }
    }
`;

export const AddPropertyFormStyle = styled.div`
    text-align: left;

    & input,
    & input:focus {
        border-left: 0;
        outline: 0;
        box-shadow: none;
    }

    .input-group-prepend {
        background-color: ${props => props.theme.lightLighter};
        cursor: default;
        display: flex;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-bottom-left-radius: 4px;
        border-top-left-radius: 4px;
        width: 28px;
        align-items: center;
        justify-content: center;
    }
`;

export const StatementsGroupStyle = styled(ListGroupItem)`
    position: relative;
    padding: 0 !important;
    border-top: 1px solid rgba(0, 0, 0, 0.125) !important;

    &:last-of-type {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    &.inTemplate:last-of-type {
        border-bottom-left-radius: ${props => (!props.enableEdit ? '4px' : '0')};
        border-bottom-right-radius: ${props => (!props.enableEdit ? '4px' : '0')};
    }

    &.inTemplate:first-of-type {
        border-top: 0;
    }

    &.inTemplate {
        border-top-width: 0 !important;
    }

    &.noTemplate {
        border-radius: 4px !important;
        margin-top: 0.75rem;

        &:first-child {
            margin-top: 0;
        }
    }
`;

export const PropertyStyle = styled.div`
    background-color: ${props => props.theme.lightLighter};
    overflow-wrap: break-word;
    border-radius: 3px 0 0 3px;

    @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
        width: 100%;
        max-width: 100%;
        flex: auto;
        border-radius: 3px 3px 0 0;
    }

    & > div {
        padding: 8px;
    }
    .propertyLabel {
        margin-right: 4px;
        font-weight: 500;
    }
    & input,
    & input:focus {
        outline: 0 !important;
        box-shadow: none !important;
        border-color: #ced4da !important;
        border-top-left-radius: 4px !important;
        border-bottom-left-radius: 4px !important;
    }

    &.editingLabel {
        padding-bottom: 15px !important;
    }

    & .propertyOptions {
        visibility: hidden;
        opacity: 0;
        transition: visibility 0.2s, opacity 0.2s;

        &.disableHover {
            visibility: visible;
            opacity: 1;
        }
    }
    &:focus {
        outline: 0;
    }
    &:hover .propertyOptions {
        visibility: visible;
        opacity: 1;
        span {
            color: ${props => props.theme.dark};
        }
        span:hover {
            color: #fff;
        }
    }
    &:focus-within .propertyOption {
        visibility: visible;
        opacity: 1;
        span {
            color: ${props => props.theme.dark};
        }
    }
`;

export const ValuesStyle = styled.div`
    & > div {
        padding: 8px;
    }
    background-color: #fff;
    border-radius: 0 3px 3px 0;

    @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
        width: 100%;
        max-width: 100%;
        flex: auto;
        border-radius: 3px 3px 0 0;
    }
`;

export const TemplateHeaderStyle = styled.div`
    cursor: default;
    background-color: ${props => props.theme.secondary};
    border-color: ${props => props.theme.secondary};
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    color: #fff;
    position: relative;
    display: block;
    padding: 0.55rem 1.25rem;
    overflow-wrap: break-word;
    word-break: break-all;

    .headerOptions {
        visibility: none;
        transition: visibility 0.2s, opacity 0.2s;
        opacity: 0;
        display: inline-block;

        &.disableHover {
            visibility: visible;
            opacity: 1;
        }
    }

    &:hover .headerOptions {
        visibility: visible;
        opacity: 1;
    }

    .form-control {
        border-width: 0;
        border-radius: 0 !important;
        height: calc(1em + 0.25rem + 4px) !important;
        padding: 0 0.5rem;
        outline: 0;

        &:focus {
            outline: 0;
            border: 1px dashed ${props => props.theme.lightDarker};
            box-shadow: none;
        }
    }
    & .type {
        font-size: 0.9rem;
        color: ${props => props.theme.lightDarker};
        opacity: 0.9;
        .span {
            background-color: ${props => props.theme.dark};
            color: ${props => props.theme.secondary};
        }
    }
`;
