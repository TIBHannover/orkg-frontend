import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { renderToString } from 'react-dom/server';

class Link extends Component {
  constructor(props) {
    super(props);
    // eslint-disable-next-line no-useless-escape
    const expression = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gi;
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
        <a
          href={labelToText.indexOf('://') === -1 ? 'http://' + labelToText : labelToText}
          target="_blank"
          rel="noopener noreferrer"
        >
          {labelToText} <Icon icon={faExternalLinkAlt} />
        </a>
      );
    } else {
      return label;
    }
  }
}

Link.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  type: PropTypes.oneOf(['resource', 'literal']),
};

export default Link;
