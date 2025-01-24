import { MathJax as MathJaxPreview } from 'better-react-mathjax';
import { FC } from 'react';
import ReactStringReplace from 'react-string-replace';
import styled from 'styled-components';

const StyledMathJax = styled(MathJaxPreview)`
    & div {
        display: inline;
    }

    & .MathJax {
        display: inline !important;
    }
`;

const expression = /(\${2}.*\${2})/gm;
const supportedValues = new RegExp(expression);

export const isMathJaxValue = (text: string) => {
    if (text.match(supportedValues)) {
        return true;
    }
    return false;
};

type MathJaxProps = {
    text: string;
};

const MathJax: FC<MathJaxProps> = ({ text }) => {
    if (isMathJaxValue(text)) {
        return ReactStringReplace(text, supportedValues, (match, i) => (
            <StyledMathJax key={i} inline>
                {match}
            </StyledMathJax>
        ));
    }
    return text;
};

export default MathJax;
