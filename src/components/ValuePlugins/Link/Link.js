import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { renderToString } from 'react-dom/server';

class Link extends Component {
    constructor(props) {
        super(props);

        const expression = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;        
        this.supportedValues = new RegExp(expression);
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        if (this.props.type === 'literal' && labelToText.match(this.supportedValues)) {
            return <a href={labelToText} target="_blank" rel="noopener noreferrer">{labelToText} <Icon icon={faExternalLinkAlt} /></a>
        } else {
            return label;
        }
    }
}

Link.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
};

export default Link;