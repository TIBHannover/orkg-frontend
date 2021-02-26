import styled from 'styled-components';
import { Button, DropdownToggle } from 'reactstrap';

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
`;

export const SmallButton = styled(Button)`
    &&& {
        padding: 0.2rem 0.75rem;
    }
`;

export const SmallDropdownToggle = styled(DropdownToggle)`
    &&& {
        padding: 0.2rem 0.75rem;
    }
`;
