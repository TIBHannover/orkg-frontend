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

const Latex = props => {
    const expression = /(\${2}.*\${2})/gm;
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
                    jax: ['input/TeX', 'output/SVG'],
                    showMathMenu: false,
                    SVG: {
                        useFontCache: false,
                        useGlobalCache: false,
                        linebreaks: { automatic: true, width: 'container' },
                    },
                    skipStartupTypeset: true,
                    'HTML-CSS': {
                        linebreaks: { automatic: true, width: 'container' },
                    },
                }}
                onLoad={() => {
                    if (!window.MathJax) {
                        return;
                    }
                    window.MathJax.Hub.Queue(['Rerender', window.MathJax.Hub]);
                }}
                math={match}
            />
        ));
    }
    return label;
};

Latex.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default Latex;
