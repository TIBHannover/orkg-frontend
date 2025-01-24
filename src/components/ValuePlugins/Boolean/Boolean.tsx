import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import styled from 'styled-components';

const Check = styled.span`
    color: #329a0c;
    font-size: 18px;
`;

const Cross = styled.span`
    color: #f02500;
    font-size: 20px;
`;

const trueValues = ['t', 'y', 'true'];
const falseValues = ['f', 'n', 'false'];

export const isBooleanValue = (text: string) => {
    const supportedValues = [...trueValues, ...falseValues];

    if (!text) {
        return false;
    }

    // if label value is not supported, return the regular item
    if (supportedValues.indexOf(text.toLowerCase()) > -1) {
        return true;
    }
    return false;
};

type BooleanProps = {
    text: string;
};

const Boolean: FC<BooleanProps> = ({ text }) => {
    if (!isBooleanValue(text)) {
        return false;
    }

    if (trueValues.indexOf(text.toLowerCase()) !== -1) {
        return (
            <Check>
                <FontAwesomeIcon icon={faCheck} aria-label="Check mark" />
            </Check>
        );
    }
    if (falseValues.indexOf(text.toLowerCase()) !== -1) {
        return (
            <Cross>
                <FontAwesomeIcon icon={faTimes} aria-label="Cross mark" />
            </Cross>
        );
    }
    return text;
};

export default Boolean;
