import { Button, Container } from 'reactstrap';
import styled from 'styled-components';

export const SubtitleSeparator = styled.div`
    background: ${(props) => props.theme.secondary};
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
        color: ${(props) => props.theme.secondary};
        width: 30px;
        height: 30px;
        cursor: pointer;
        transition: 0.2s filter;
        padding: 0;
        margin: 5px 0 0 0;
        line-height: 1;
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

    &:not(.contribution-editor) {
        .table {
            .tr:hover .td > div > div {
                background: #f0f2f7;
            }
            .tr .td > div > .itemGroup,
            .tr:hover .td > div > .itemGroup {
                background: ${(props) => props.theme.lightDarker};
            }
            .tr:hover .td .columnProperty > div {
                background: #8b91a5;
            }
            .tr .td .columnPropertyGroup > div,
            .tr:hover .td .columnPropertyGroup > div {
                background: ${(props) => props.theme.secondaryDarker};
            }
            .tr:hover .td .columnContribution > div:first-child {
                color: ${(props) => props.theme.primary};
                background: #d77171;
            }
            // animate the background change on hover
            .tr .td > div > div {
                transition: background 0.2s;
            }
            .tr .td .columnProperty > div {
                transition: background 0.2s;
            }
        }
    }

    &.contribution-editor {
        .table {
            .tr .td:not(.sticky) > div > div:hover {
                background: #f0f2f7;
            }
            .tr div[data-sticky-td] > .columnProperty > div:hover {
                background: #8b91a5;
            }
        }
    }

    .table > :not(caption) > * > * {
        padding: initial; // remove default bootstrap table padding
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
            &:last-child {
                .td {
                    border-bottom: 0;
                }
            }
        }

        .comparisonRow .tr:last-child .td > div > div:first-child {
            // border-radius: 0 0 0 ${(props) => props.theme.borderRadius} !important;
        }

        &.sticky {
            .header {
                top: 0;

                .th:last-child > div > div {
                    border-radius: 0 ${(props) => props.theme.borderRadius} 0 0;
                }
            }

            .comparisonRow {
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
    background: ${(props) => props.theme.light};

    // for contribution editor, show edit/delete buttons on hover
    &:hover .cell-buttons {
        display: block;
    }
`;

export const PropertiesInner = styled.div<{ $transpose?: boolean; cellPadding?: number }>`
    background: ${(props) => (props.$transpose ? (props) => props.theme.primary : (props) => props.theme.secondary)};
    height: 100%;
    color: #fff;
    padding: ${(props) => props.cellPadding ?? 10}px 10px;
    border-bottom: ${(props) => (props.$transpose ? 'thin solid #fff!important' : 'thin solid #8B91A5!important')};
    overflow-wrap: anywhere;
    white-space: normal;
    a {
        color: #fff !important;
    }

    &.first {
        border-radius: ${(props) => props.theme.borderRadius} 0 0 0;
        background: ${(props) => props.theme.secondary};
    }

    &.last {
        border-radius: 0 0 0 ${(props) => props.theme.borderRadius};
    }
`;

export const ItemHeader = styled.div`
    min-height: 50px;
    background-color: ${(props) => props.theme.light};
    margin: 0;
    height: 100%;
    position: relative;
`;

export const ItemHeaderInner = styled.div<{ $transpose?: boolean }>`
    padding: 5px 10px;
    background: ${(props) => (!props.$transpose ? (props) => props.theme.primary : (props) => props.theme.secondary)};
    border-radius: 0 0 0 0;
    color: #fff;
    height: 100%;
    overflow-wrap: anywhere;
    white-space: normal;
    a {
        color: #fff !important;
    }
    &.contribution-editor {
        background: ${(props) => props.theme.light};
    }
`;

export const Contribution = styled.div`
    color: #fff;
    font-size: 90%;
    font-style: italic;
    border-top: thin solid #d75050;
    margin-top: 2px;
    padding-top: 2px;
    &.contribution-editor {
        color: ${(props) => props.theme.secondaryDarker};
        border-top-color: #d0d5e8;
    }
`;

export const ContributionButton = styled(Button)`
    padding: 0;
    color: inherit !important;
    font-size: inherit;
    text-decoration: none;
`;

export const Delete = styled.button`
    position: absolute;
    border: 0;
    top: 0px;
    right: 0px;
    background: #ffa3a3;
    border-radius: 20px;
    width: 24px;
    height: 24px;
    color: ${(props) => props.theme.primary};
    cursor: pointer;
    justify-content: center;
    display: flex;
    align-items: center;

    &:hover {
        background: #fff;
    }
    &.contribution-editor {
        color: ${(props) => props.theme.light};
        right: -5px;
        background: ${(props) => props.theme.secondary};
        &:hover {
            background: ${(props) => props.theme.secondaryDarker};
        }
    }
`;

export const ClickableScrollButton = styled.button<{ $leftOffset?: string }>`
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
        height: calc(100% - 2px);
        box-shadow: rgba(0, 0, 0, 0.18) -9px 0px 5px -5px inset;

        &:hover {
            box-shadow: rgba(0, 0, 0, 0.25) -13px 0px 5px -5px inset;
        }
    }

    &.left {
        cursor: w-resize;
        left: ${(props) => props.$leftOffset};
        top: 10px;
        height: calc(100% - 12px);

        box-shadow: rgba(0, 0, 0, 0.18) 9px 0px 5px -5px inset;

        &:hover {
            box-shadow: rgba(0, 0, 0, 0.25) 13px 0px 5px -5px inset;
        }
    }
`;
