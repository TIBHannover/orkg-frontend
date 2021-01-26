import styled from 'styled-components';
import { Input } from 'reactstrap';

export const TippyContainer = styled.div`
    overflow: visible;
    background: white;
    display: flex;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 0 1px;
    //margin-left: 0.5px;
`;

/** adding styled divs for different cell items **/
export const TableCell = styled.div`
    &.noselect {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
        -khtml-user-select: none; /* Konqueror HTML */
        -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
        user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
    }
`;

/** adding styled divs for different cell items **/
export const PropertyCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    color: white;
    background: ${props => props.theme.darkblue};
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    width: 150px;
    min-width: 150px;
    padding: 0 2px;
    margin: 1px 1px 0 1px;
`;

// Map and Edit Property
export const PropertyCellEditor = styled(TableCell)`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    color: white;
    background: ${props => props.theme.darkblue};
    width: 150px;
    min-width: 150px;
    padding: 0 2px;
    margin: 1px 1px 0 1px;
    cursor: pointer;
`;

export const ValueCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    padding: 0 2px;

    background: rgb(233, 235, 242) !important;
    color: black;
    width: 150px;
    min-width: 150px;
    height: 30px;
    line-height: 30px;
    margin: 1px 1px;
`;

export const ContributionCell = styled(TableCell)`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    background: ${props => props.theme.primary};
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    line-height: 30px;
    padding: 0 2px;
    margin: 1px 1px;
`;

export const MetaCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: white;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
`;

export const MetaMapperSelector = styled.div`
    overflow: visible;
    background: white;
    display: flex;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 0 1px;
    //margin-left: 0.5px;
`;

// Map and Edit Header
export const MetaMapperSelectorSimple = styled.div`
    overflow: visible;
    background: white;
    display: flex;
    color: white;
    width: 150px;
    min-width: 150px;
    margin: 0 1px;
    //padding-left: 28px;
`;

export const PropertyCellInput = styled(Input)`
    background: #fff;
    color: ${props => props.theme.orkgPrimaryColor};
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: 30px !important;
    width: 150px !important;
    min-width: 150px;

    &:focus {
        background: #fff;
        color: ${props => props.theme.orkgPrimaryColor};
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

export const ValueCellValidator = styled(TableCell)`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    background: ${props => (props.isValid ? '#4caf50' : '#fda9a9')};
    color: black;
    width: 150px;
    min-width: 150px;
    height: 30px;
    line-height: 30px;
    margin: 1px 1px;
    padding: 0 2px;
`;

export const ValueCellInput = styled(Input)`
    background: #fff;
    color: black;
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: 30px !important;
    width: 150px !important;
    min-width: 150px;
    margin: 1px 1px;
    padding: 0 2px;

    &:focus {
        background: #fff;
        color: black;
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

export const ContributionCellInput = styled(Input)`
    background: #fff;
    color: black;
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: 30px !important;
    width: 150px !important;
    min-width: 150px;
    margin: 1px 1px;

    &:focus {
        background: #fff;
        color: black;
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;
