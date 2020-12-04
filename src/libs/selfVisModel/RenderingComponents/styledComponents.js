import styled from 'styled-components';
import { Input } from 'reactstrap';

/** adding styled divs for different cell items **/
export const PropertyCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    color: white;
    background: #80869b;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    width: 150px;
    min-width: 150px;
    height: 31px;
    padding: 0 2px;
    margin: 0 1px;
`;

export const PropertyCellEditor = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    color: white;
    background: #80869b;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    width: 150px;
    min-width: 150px;
    height: 31px;
    padding: 0 2px;
    margin: 0 1px;
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
    margin: 1px 1px;
`;

export const ContributionCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    background: #e86161;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
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

    margin: 1px 1px;
    margin-left: 0.5px;
`;
export const MetaMapperSelectorSimple = styled.div`
    overflow: visible;
    background: white;

    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
    padding-left: 28px;
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

export const ValueCellValidator = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: ${props => (props.isValid ? '#4caf50' : '#fda9a9')};
    color: black;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
    padding: 0 2px;
`;

export const ValueCellInput = styled(Input)`
    background: #fff;
    color: black
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
        color: black
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

export const ContributionCellInput = styled(Input)`
    background: #fff;
    color: black
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
        color: black
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;
