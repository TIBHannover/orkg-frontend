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

export const ScrollButton = styled(Button)`
    &&& {
        border-radius: 30px;
        color: ${props => props.theme.darkblue};
        width: 30px;
        height: 30px;
        cursor: pointer;
        transition: 0.2s filter;
        padding: 0;
        margin: 0;
        border: 0;

        &.next {
            float: right;
        }
        &.back {
            float: left;
        }
        &:hover,
        &:focus {
            filter: brightness(85%);
        }
    }
`;

export const ReactTableWrapper = styled.div`
    /* This is required to make the table full-width */
    position: relative;
    display: flex;
    flex-direction: column;

    .disable-scrollbars {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */
        &::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
            background: transparent; /* Chrome/Safari/Webkit */
            width: 0;
            height: 0;
        }
    }

    .table {
        position: relative;
        scroll-behavior: smooth;
        overflow: visible !important;
        flex: auto 1;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        border-collapse: collapse;
        .tr {
            flex: 1 0 auto;
            display: inline-flex;
            :last-child {
                .td {
                    border-bottom: 0;
                }
            }
        }

        .comparisonBody .tr:last-child .td > div div:first-child {
            //border-bottom: 2px solid #d5dae4 !important;
            border-radius: 0 0 11px 11px !important;
        }
        .tr:hover .td > div > div {
            background: #e7eaf1;
        }
        .tr:hover .td .columnProperty > div {
            background: #8b91a5;
        }
        .tr:hover .td .columnContribution > div:first-child {
            color: #e86161;
            background: #d77171;
        }

        &.sticky {
            overflow: scroll;

            .header {
                top: 0;
            }

            .comparisonBody {
                position: relative;
                z-index: 0;
            }
        }
    }
`;
export const Properties = styled.div`
    padding: 0 0 0 0 !important;
    margin: 0;
    height: 100%;
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
    min-height: 50px;
    padding: 0 10px !important;
    margin: 0;
    height: 100%;
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

export const ClickableScrollButton = styled.button`
    width: 30px;
    position: absolute;
    z-index: 10;
    transition: box-shadow 0.5s;
    background: transparent;
    border: 0;
    outline: 0 !important;

    &.right {
        cursor: e-resize;
        right: 0;
        top: 0;
        height: 100%;
        box-shadow: rgba(0, 0, 0, 0.18) -9px 0px 5px -5px inset;

        &:hover {
            box-shadow: rgba(0, 0, 0, 0.25) -13px 0px 5px -5px inset;
        }
    }

    &.left {
        cursor: w-resize;
        left: 250px;
        top: 10px;
        height: calc(100% - 20px);

        box-shadow: rgba(0, 0, 0, 0.18) 9px 0px 5px -5px inset;

        &:hover {
            box-shadow: rgba(0, 0, 0, 0.25) 13px 0px 5px -5px inset;
        }
    }
`;
