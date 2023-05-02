import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import MathJax from 'react-mathjax-preview';
import ReactStringReplace from 'react-string-replace';
import styled from 'styled-components';

const StyledMathJax = styled(MathJax)`
    display: inline;
    & div {
        display: inline;
    }

    & .MathJax_Display {
        display: inline !important;
    }
`;

const AsciiMath = props => {
    // eslint-disable-next-line no-useless-escape
    const expression = /(\`.*\`)/g;
    const supportedValues = new RegExp(expression);
    const label = props.children;
    const labelToText = renderToString(label);

    if (!labelToText) {
        return '';
    }

    if (props.type === ENTITIES.LITERAL && labelToText.match(supportedValues)) {
        return ReactStringReplace(labelToText, supportedValues, (match, i) => (
            <StyledMathJax
                key={i}
                config={{
                    jax: ['input/AsciiMath', 'output/CommonHTML'],
                    showMathMenu: false,
                    SVG: {
                        useFontCache: false,
                        useGlobalCache: false,
                    },
                    skipStartupTypeset: true,
                }}
                math={match}
            />
        ));
    }
    return label;
};

AsciiMath.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default AsciiMath;
