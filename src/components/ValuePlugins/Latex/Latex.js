import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MathJax from 'react-mathjax-preview-svg'
import { renderToString } from 'react-dom/server';
import styled from 'styled-components';

const StyledMathJax = styled(MathJax)`
  display: inline;

  & div{
    display: inline;
  }
`;

class Latex extends Component {
  constructor(props) {
    super(props);
    const expression = /^\$\$.*\$\$$/g;
    this.supportedValues = new RegExp(expression);
  }

  render() {
    const label = this.props.children;
    const labelToText = renderToString(label);

    if (!labelToText) {
      return '';
    }

    if (this.props.type === 'literal' && labelToText.match(this.supportedValues)) {
      return (
        <StyledMathJax math={labelToText.substr(1).substring(0, labelToText.substr(1).length - 1)} />
      );
    } else {
      return label;
    }
  }
}

Latex.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  type: PropTypes.oneOf(['resource', 'literal']),
};

export default Latex;
