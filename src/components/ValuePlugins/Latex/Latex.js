import { Component } from 'react';
import PropTypes from 'prop-types';
import MathJax from 'react-mathjax-preview';
import { renderToString } from 'react-dom/server';
import styled from 'styled-components';
import ReactStringReplace from 'react-string-replace';

const StyledMathJax = styled(MathJax)`
    display: inline;
    & div {
        display: inline;
    }

    & .MathJax_Display {
        display: inline !important;
    }
`;

class Latex extends Component {
    constructor(props) {
        super(props);
        const expression = /(\${2}.*\${2})/gm;
        this.supportedValues = new RegExp(expression);
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        if (this.props.type === 'literal' && labelToText.match(this.supportedValues)) {
            return ReactStringReplace(labelToText, this.supportedValues, (match, i) => (
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
    }
}

Latex.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
};

export default Latex;
