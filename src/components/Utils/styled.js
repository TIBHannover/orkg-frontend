import styled from 'styled-components';
import { components } from 'react-select';

/*reactTagsinputTag*/
export const StyledMultiValueLabel = styled(components.MultiValueLabel)`
    background-color: ${props => props.theme.orkgPrimaryColor};
    border-radius: 2px;
    border: 1px solid ${props => props.theme.orkgPrimaryColor};
    color: #fff;
    border-radius: 999px;
    display: inline-block;
    padding: 0 7px;
    margin: 7px 2px 0;
    font-size: 90%;
`;



/*researchFieldsInput*/
export const StyledAuthorsInputFormControl = styled.div`
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    height: auto !important;
    min-height: calc(2.25rem + 4px);
    cursor: text;
    padding: 0 !important;

    & input {
    border: 0;
    background: transparent;
    max-width: 100%;
    outline: 0;
    margin: 0;
    padding: 0;
    }
`;