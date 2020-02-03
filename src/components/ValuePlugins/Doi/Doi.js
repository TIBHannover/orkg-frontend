import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { renderToString } from 'react-dom/server';

class Doi extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line no-useless-escape
        const expression = /^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
        this.supportedValues = new RegExp(expression);
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        if (this.props.type === 'literal' && labelToText.trim().match(this.supportedValues)) {
            return (
                <a href={`https://doi.org/${labelToText}`} target="_blank" rel="noopener noreferrer">
                    {labelToText} <Icon icon={faExternalLinkAlt} />
                </a>
            );
        } else {
            return label;
        }
    }
}

Doi.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal'])
};

export default Doi;
