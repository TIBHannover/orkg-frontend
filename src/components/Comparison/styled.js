import styled from 'styled-components';
import { Container, Button } from 'reactstrap';

export const SubtitleSeparator = styled.div`
    background: ${props => props.theme.darkblue};
    width: 2px;
    height: 30px;
    margin: 0 15px;
    content: '';
    display: block;
    opacity: 0.7;
`;

export const ComparisonTitle = styled.div`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-right: 20px;
    color: #62687d;
`;

export const ContainerAnimated = styled(Container)`
    transition: 0.5s max-width;
`;

export const ComparisonTypeButton = styled(Button)`
    img {
        transition: 0.3s opacity;
        opacity: 1;
        width: 163px; // set width, so positioning is correct after opening dropdown menu
    }
    &:hover img {
        opacity: 0.75;
    }
    &.active {
        border: 2px solid;
    }
`;

export const ScrollButton = styled.div`
    border-radius: 30px;
    color: ${props => props.theme.darkblue};
    width: 30px;
    height: 30px;
    font-size: 27px;
    cursor: pointer;
    transition: 0.2s filter;

    &.next {
        float: right;
    }
    &.back {
        float: left;
    }
    &:hover {
        filter: brightness(85%);
    }
`;

export const ReactTableWrapper = styled.div`
    clear: both;
    position: relative;
    padding: 10px 0;
    font-size: ${props => (props.smallerFontSize ? '0.95rem' : '1rem')};

    & .rt-th.rthfc-th-fixed-left-last {
        border-radius: 11px 11px 0 0;
    }
    & .rthfc-td-fixed-left-last {
        border-radius: 0 0 11px 11px !important;
    }

    .rthfc .-filters .rt-th.rthfc-th-fixed-left-last,
    .rthfc .rt-th.rthfc-th-fixed-left-last,
    .rthfc .rt-td.rthfc-td-fixed-left-last,
    .ReactTable .rt-tbody .rt-td,
    .ReactTable {
        border: 0;
    }
    .ReactTable .rt-th,
    .ReactTable .rt-td,
    .ReactTable .rt-thead .rt-th,
    .ReactTable .rt-thead .rt-td {
        padding: 0;
        border: 0;
        overflow: initial;
        white-space: initial;
    }
    .ReactTable .rt-th > div {
        height: 100%;
    }
    .ReactTable .rt-tbody .rt-tr-group {
        border: 0;
    }
    .ReactTable .rt-thead .rt-tr {
        text-align: left;
        position: sticky;
        top: 0;
        background: white;
    }
    .ReactTable .rt-table {
        position: relative;
        scroll-behavior: smooth;
        overflow: visible !important;
    }
    .ReactTable .rt-thead.-header {
        box-shadow: none;
        top: 0px;
        overflow: auto;
    }
    .ReactTable .rt-tbody .rt-tr-group:last-child .rt-td > div div:first-child {
        border-bottom: 2px solid #d5dae4 !important;
        border-radius: 0 0 11px 11px !important;
    }
    .ReactTable .disable-scrollbars {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
        &::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
            background: transparent; /* Chrome/Safari/Webkit */
            width: 0;
            height: 0;
        }
    }
    .ReactTable .rt-tr:hover .rt-td > div > div {
        background: #e7eaf1;
    }
    .ReactTable .rt-tr:hover .rthfc-td-fixed-left > .columnProperty > div {
        background: #8b91a5;
    }
    .ReactTable .rt-tr:hover .rthfc-td-fixed-left > .columnContribution > div:first-child {
        color: #e86161;
        background: #d77171;
    }
`;

export const Properties = styled.div`
    padding: 0 0 0 0 !important;
    margin: 0;
    margin-right: 10px !important;
    display: inline-block;
    height: 100%;
    width: 250px;
    position: relative;
    background: #fff;
`;

export const PropertiesInner = styled.div`
    background: ${props => (props.transpose ? '#E86161' : '#80869B')};
    height: 100%;
    color: #fff;
    padding: ${props => props.cellPadding ?? 10}px 10px;
    border-bottom: ${props => (props.transpose ? '2px solid #fff!important' : '2px solid #8B91A5!important')};
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    a {
        color: #fff !important;
    }

    &.first {
        border-radius: 11px 11px 0 0;
    }

    &.last {
        border-radius: 0 0 11px 11px;
    }
`;

export const ItemHeader = styled.div`
    padding-right: 10px;
    min-height: 50px;
    padding: 0 10px !important;
    margin: 0;
    display: inline-block;
    height: 100%;
    width: 250px;
    position: relative;
`;

export const ItemHeaderInner = styled.div`
    padding: 5px 10px;
    background: ${props => (!props.transpose ? '#E86161' : '#80869B')};
    border-radius: 11px 11px 0 0;
    color: #fff;
    height: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    a {
        color: #fff !important;
    }
`;

export const Contribution = styled.div`
    color: #ffa5a5;
    font-size: 85%;
`;

export const Delete = styled.div`
    position: absolute;
    top: 0px;
    right: 5px;
    background: #ffa3a3;
    border-radius: 20px;
    width: 24px;
    height: 24px;
    color: #e86161;
    cursor: pointer;
    justify-content: center;
    display: flex;
    align-items: center;

    &:hover {
        background: #fff;
    }
`;

export const ClickableScroll = styled.div`
    width: 30px;
    height: 100%;
    position: absolute;
    z-index: 10;
    transition: box-shadow 0.5s;

    &.right {
        cursor: e-resize;
        right: 0;
        top: 0;
        box-shadow: rgba(0, 0, 0, 0.18) -9px 0px 5px -5px inset;

        &:hover {
            box-shadow: rgba(0, 0, 0, 0.25) -13px 0px 5px -5px inset;
        }
    }

    &.left {
        cursor: w-resize;
        left: 250px;
        top: 10px;
        box-shadow: rgba(0, 0, 0, 0.18) 9px 0px 5px -5px inset;

        &:hover {
            box-shadow: rgba(0, 0, 0, 0.25) 13px 0px 5px -5px inset;
        }
    }
`;
