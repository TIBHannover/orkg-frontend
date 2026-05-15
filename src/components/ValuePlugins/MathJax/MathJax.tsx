import { MathJax as MathJaxPreview } from 'better-react-mathjax';
import { FC } from 'react';
import ReactStringReplace from 'react-string-replace';

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
            <MathJaxPreview key={i} inline className="[&_div]:inline [&_.MathJax]:!inline">
                {match}
            </MathJaxPreview>
        ));
    }
    return text;
};

export default MathJax;
