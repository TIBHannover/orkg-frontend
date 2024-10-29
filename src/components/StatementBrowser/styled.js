import styled from 'styled-components';
import { ListGroupItem, DropdownItem, Button, DropdownToggle } from 'reactstrap';

/* dropdownItem */
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
    color: ${(props) => props.theme.dark} !important;
    background: ${(props) => props.theme.lightDarker} !important;
    &:hover {
        color: #fff !important;
        background-color: ${(props) => props.theme.secondary} !important;
        border-color: ${(props) => props.theme.secondary} !important;
    }
`;

export const StyledDropdownToggle = styled(DropdownToggle)`
    border-top-left-radius: ${(props) => (props.disableBorderRadiusLeft ? '0' : '4px !important')};
    border-bottom-left-radius: ${(props) => (props.disableBorderRadiusLeft ? '0' : '4px !important')};
    border-top-right-radius: ${(props) => (props.disableBorderRadiusRight ? '0' : '4px !important')};
    border-bottom-right-radius: ${(props) => (props.disableBorderRadiusRight ? '0' : '4px !important')};
    background: ${(props) => props.theme.lightDarker} !important;
    color: ${(props) => props.theme.dark} !important;
    border-color: #ced4da !important;
    &:hover {
        color: #fff !important;
        background-color: ${(props) => props.theme.secondary} !important;
        border-color: ${(props) => props.theme.secondary} !important;
    }
`;

export const ValueItemStyle = styled.li.attrs({
    className: 'list-group-item', // refs are not passed correctly by reactstrap, so instead of using ListGroupItem, we manually apply the class
})`
    background-color: #fff;
    overflow-wrap: anywhere;
    padding: 8px 0px !important;

    &:last-child {
        margin-bottom: 5px;
    }

    .valueOptions {
        display: inline-block !important;
        transition: opacity 0.2s;
        opacity: 0;
        // "visibility: hidden" behaves like a combination of "opacity: 0" and "pointer-events: none".
        pointer-events: none;

        &.disableHover {
            opacity: 1;
            pointer-events: auto;
        }
    }

    &:hover .valueOptions {
        opacity: 1;
        pointer-events: auto;
    }

    &:focus-within .valueOptions {
        opacity: 1;
        pointer-events: auto;
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
        line-height: 1.8;
    }

    .literalLabel {
        display: inline;
        margin-right: 4px;
        text-decoration: none;
        cursor: text;
        line-height: 1.8;
    }

    .typeCircle {
        width: 18px;
        height: 18px;
        line-height: 15px;
        text-align: center;
        color: white;
        display: inline-block;
        border: 1px ${(props) => props.theme.secondaryDarker} solid;
        margin-right: 3px;
        border-radius: 100%;
        font-size: 9px;
        font-weight: bold;
        background: ${(props) => props.theme.secondary};
    }

    &:hover .typeCircle {
        background: ${(props) => props.theme.primary};
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
    color: ${(props) => props.theme.secondary};
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

        button:not(.btn-smart) {
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
                color: ${(props) => props.theme.secondary};
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
`;

export const StatementsGroupStyle = styled.div`
    position: relative;
    padding: 0 !important;
    border: 1px solid rgba(0, 0, 0, 0.125) !important;

    &:last-of-type {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    &.inTemplate:last-of-type {
        border-bottom-left-radius: ${(props) => (!props.enableEdit ? '4px' : '0')};
        border-bottom-right-radius: ${(props) => (!props.enableEdit ? '4px' : '0')};
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
    background-color: ${(props) => props.theme.lightLighter};
    overflow-wrap: break-word;
    border-radius: 3px 0 0 3px;

    @media (max-width: ${(props) => props.theme.gridBreakpoints.md}) {
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
        opacity: 0;
        // "visibility: hidden" behaves like a combination of "opacity: 0" and "pointer-events: none".
        pointer-events: none;
        transition: opacity 0.2s;

        &.disableHover {
            opacity: 1;
            pointer-events: auto;
        }
    }
    &:focus {
        outline: 0;
    }
    &:hover .propertyOptions {
        opacity: 1;
        pointer-events: auto;
        span {
            color: ${(props) => props.theme.dark};
        }
        span:hover {
            color: #fff;
        }
    }
    &:focus-within .propertyOption {
        opacity: 1;
        pointer-events: auto;
        span {
            color: ${(props) => props.theme.dark};
        }
    }
`;

export const ValuesStyle = styled.div`
    & > div {
        padding: 8px;
    }
    background-color: #fff;
    border-radius: 0 3px 3px 0;

    @media (max-width: ${(props) => props.theme.gridBreakpoints.md}) {
        width: 100%;
        max-width: 100%;
        flex: auto;
        border-radius: 3px 3px 0 0;
    }
`;
