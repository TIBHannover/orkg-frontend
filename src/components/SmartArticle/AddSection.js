import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { Button } from 'reactstrap';

export const InvisibleByDefault = styled.div`
    button {
        visibility: hidden;
    }

    &:hover button {
        visibility: visible;
    }
`;

export const AddSectionStyled = styled(Button)`
    color: ${props => props.theme.darkblue}!important;
    font-size: 140% !important;
    margin: 5px 0 !important;
`;

const AddSection = () => {
    const handleClick = () => {
        // show toolbar
    };

    return (
        <InvisibleByDefault className="d-flex align-items-center justify-content-center add">
            <AddSectionStyled color="link" className="p-0" onClick={handleClick}>
                <Icon icon={faPlusCircle} />
            </AddSectionStyled>
        </InvisibleByDefault>
    );
};

export default AddSection;
