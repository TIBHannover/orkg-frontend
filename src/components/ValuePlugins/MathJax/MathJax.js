import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import { MathJax as MathJaxPreview } from 'better-react-mathjax';
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

const MathJax = (props) => {
    const expression = /(\${2}.*\${2})/gm;
    const supportedValues = new RegExp(expression);
    const label = props.children;
    const labelToText = renderToString(label);

    if (!labelToText) {
        return '';
    }

    if (props.type === ENTITIES.LITERAL && labelToText.match(supportedValues)) {
        return ReactStringReplace(labelToText, supportedValues, (match, i) => (
            <StyledMathJax key={i} inline>
                {match}
            </StyledMathJax>
        ));
    }
    return label;
};

MathJax.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default MathJax;
