import { Button } from 'reactstrap';
import styled from 'styled-components';
import Gravatar from 'react-gravatar';

export const SubtitleSeparator = styled.div`
    background: ${props => props.theme.secondary};
    width: 2px;
    height: 24px;
    margin: 0 15px;
    content: '';
    display: block;
    opacity: 0.7;
`;

export const SubTitle = styled.div`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-right: 20px;
    color: ${props => props.theme.secondary};
`;

export const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.lightDarker};
    cursor: pointer;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }
`;

export const StyledDotGravatar = styled.div`
    width: 48px;
    height: 48px;
    display: inline-block;
    text-align: center;
    line-height: 48px;
    color: ${props => props.theme.secondary};
    border: 2px solid ${props => props.theme.lightDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }

    background-color: ${props => props.theme.lightDarker};
`;

export const ContributorsAvatars = styled.div`
    display: inline-block;

    & > div {
        display: inline-block;
        margin-right: 10px;
        margin-bottom: 10px;
    }

    & > div:last-child {
        margin-right: 0;
    }
`;

export const SearchStyled = styled.div`
    &&& {
        padding: 0;
        margin-left: 1px !important;
        display: flex;
    }
`;

export const InputStyled = styled.input`
    background: transparent;
    line-height: 0.7;
    padding: 2px 10px;
    height: 28px;
    border: 0;
    color: #fff;
    width: 200px;
    animation: width 0.2s normal forwards ease-in-out;
    outline: 0;

    &::placeholder {
        color: #fff;
        opacity: 0.6;
    }

    @keyframes width {
        from {
            width: 50px;
        }
        to {
            width: 200px;
        }
    }
`;

export const SearchButtonStyled = styled(Button)`
    &&& {
        color: #fff;
        border: 0;
    }
`;
