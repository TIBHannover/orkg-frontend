import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

export const ComparisonBoxButton = styled(Button)`
    border-radius: 11px 11px 0 0 !important;
    padding: 7px 20px !important;
    font-size: 95% !important;
    float: right;
    box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.13);
`;

export const ComparisonBox = styled.div`
    background: ${props => props.theme.primary};
    border-radius: 11px 11px 0 0;
    width: 340px;
    min-height: 390px;
    box-shadow: 0px -1px 8px 0px rgba(0, 0, 0, 0.13);
    position: relative;
`;

export const Header = styled.div`
    cursor: pointer;
    color: #fff;
    padding: 9px 20px 9px 15px;
    border-bottom: 2px solid #ef8282;
`;

export const List = styled.ul`
    list-style: none;
    color: #fff;
    padding: 0;
    height: 300px;
    overflow-y: auto;
`;

export const ContributionItem = styled.li`
    border-bottom: 2px solid #ef8282;
    padding: 8px 15px;
`;

export const Title = styled(Link)`
    color: #fff;
    font-size: 90%;

    &:hover {
        color: inherit;
    }
`;

export const Number = styled.div`
    font-size: 90%;
    opacity: 0.5;
`;

export const StartComparison = styled(Button)`
    bottom: 0;
    font-size: 95% !important;
`;

export const Remove = styled.div`
    cursor: pointer;
`;
