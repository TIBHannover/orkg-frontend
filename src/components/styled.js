import styled from 'styled-components';
import Gravatar from 'react-gravatar';

export const SubtitleSeparator = styled.div`
    background: ${props => props.theme.darkblue};
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
    color: ${props => props.theme.darkblue};
`;

export const StyledGravatar = styled(Gravatar)`
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
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
    color: ${props => props.theme.darkblue};
    border: 2px solid ${props => props.theme.ultraLightBlueDarker};
    cursor: pointer;
    vertical-align: sub;
    &:hover {
        border: 2px solid ${props => props.theme.primary};
    }

    background-color: ${props => props.theme.ultraLightBlueDarker};
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
