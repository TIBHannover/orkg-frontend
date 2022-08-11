import styled from 'styled-components';

export const StyledActivity = styled.div`
    border-left: 3px solid ${props => props.theme.lightDarker};
    color: ${props => props.theme.bodyColor};
    position: relative;
    font-size: 15px;
    padding-top: 0.05px;

    .time {
        color: ${props => props.theme.secondaryDarker};
        margin-top: -8px;
        margin-bottom: 0.2rem;
        font-size: 16px;
        color: rgba(100, 100, 100, 0.57);
        font-size: 95%;
    }
    &::before {
        width: 0.7rem;
        height: 0.7rem;
        margin-left: -1.45rem;
        margin-right: 0.5rem;
        border-radius: 14px;
        content: '';
        background-color: ${props => props.theme.lightDarker};
        display: inline-block;
        position: absolute;
        margin-top: -2px;
    }
    a {
        color: ${props => props.theme.primary};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;
