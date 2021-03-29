import styled from 'styled-components';

export const StyledActivity = styled.div`
    border-left: 3px solid ${props => props.theme.ultraLightBlueDarker};
    color: ${props => props.theme.bodyColor};
    position: relative;
    font-size: 15px;
    .time {
        color: ${props => props.theme.darkblueDarker};
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 16px;
    }
    .time::before {
        width: 0.7rem;
        height: 0.7rem;
        margin-left: -1.45rem;
        margin-right: 0.5rem;
        border-radius: 14px;
        content: '';
        background-color: ${props => props.theme.ultraLightBlueDarker};
        display: inline-block;
        position: absolute;
        margin-top: 3px;
    }
    a {
        color: ${props => props.theme.ORKGPrimaryColor};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;
