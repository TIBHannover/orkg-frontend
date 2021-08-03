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

class AsciiMath extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line no-useless-escape
        const expression = /(\`.*\`)/g;
        this.supportedValues = new RegExp(expression);
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        if (this.props.type === 'literal' && labelToText.match(this.supportedValues)) {
            return ReactStringReplace(labelToText, this.supportedValues, (match, i) => {
                return (
                    <StyledMathJax
                        key={i}
                        config={{
                            jax: ['input/AsciiMath', 'output/CommonHTML'],
                            showMathMenu: false,
                            SVG: {
                                useFontCache: false,
                                useGlobalCache: false
                            },
                            skipStartupTypeset: true
                        }}
                        math={match}
                    />
                );
            });
        } else {
            return label;
        }
    }
}

AsciiMath.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal'])
};

export default AsciiMath;
