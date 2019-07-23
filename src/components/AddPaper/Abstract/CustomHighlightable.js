import Highlightable from 'highlightable';
import Node from './Node';
import React from 'react';
import PropTypes from 'prop-types';

class CustomHighlightable extends Highlightable {
  
  getLetterNode(charIndex, range) {
    return (
      <Node
        id={this.props.id}
        range={range}
        charIndex={charIndex}
        key={`${this.props.id}-${charIndex}`}
        highlightStyle={this.props.highlightStyle}
      >
        {this.props.text[charIndex]}
      </Node>);
  }
}

CustomHighlightable.propTypes = {
  ranges: PropTypes.array,
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  text: PropTypes.string,
  enabled: PropTypes.bool,
  onMouseOverHighlightedWord: PropTypes.func,
  onTextHighlighted: PropTypes.func,
  highlightStyle: PropTypes.object,
  style: PropTypes.object,
  rangeRenderer: PropTypes.func
};

export default CustomHighlightable;